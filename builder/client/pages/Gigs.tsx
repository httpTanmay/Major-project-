import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Gig, PackageName, PackageTier, deleteGig, ensureUserId, getGigs, getRole, upsertGig } from "@/lib/storage";

function GateSeller({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (role !== "seller")
    return (
      <section className="container py-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Seller only</h1>
          <p className="mt-2 text-muted-foreground">This section is only available to sellers. Please register as a Freelancer or switch account.</p>
        </div>
      </section>
    );
  return <>{children}</>;
}

function ToolbarBtn({ cmd, label }: { cmd: string; label: string }) {
  return (
    <button
      type="button"
      className="px-2 py-1 text-xs rounded border bg-white hover:bg-secondary"
      onClick={() => document.execCommand(cmd)}
    >
      {label}
    </button>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex gap-2 p-2 border-b bg-secondary/50">
        <ToolbarBtn cmd="bold" label="Bold" />
        <ToolbarBtn cmd="italic" label="Italic" />
        <ToolbarBtn cmd="insertUnorderedList" label="Bullets" />
      </div>
      <div
        className="prose prose-sm max-w-none p-3 min-h-32 outline-none"
        contentEditable
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

function MultiInput({ label, placeholder, values, onChange }: { label: string; placeholder: string; values: string[]; onChange: (vals: string[]) => void }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
            {v}
            <button className="text-muted-foreground" onClick={(e) => { e.preventDefault(); const next = values.slice(); next.splice(i,1); onChange(next); }}>×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} />
        <Button type="button" onClick={() => { if (!input.trim()) return; onChange([...values, input.trim()]); setInput(""); }}>Add</Button>
      </div>
    </div>
  );
}

const categories = {
  "Design": ["Logo Design", "Brand Style Guides", "Web & App Design", "Other"],
  "Development": ["Frontend", "Backend", "Full-stack", "Other"],
  "Marketing": ["SEO", "Social Media", "Email Marketing", "Other"],
  "Writing": ["Copywriting", "Blog Posts", "Technical Writing", "Other"],
};

const packageNames: PackageName[] = ["Basic", "Standard", "Premium"];

export default function Gigs() {
  const sellerId = ensureUserId();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Design");
  const [subcategory, setSubcategory] = useState<string>("Logo Design");
  const [otherSub, setOtherSub] = useState("");
  const [desc, setDesc] = useState("<p>Describe your gig...</p>");
  const [skills, setSkills] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [gallery, setGallery] = useState<{ url: string; type: "image" | "video" }[]>([]);

  const [packages, setPackages] = useState<PackageTier[]>(
    packageNames.map((name) => ({ name, price: 0, deliveryDays: 7, revisions: 1, extras: {} }))
  );

  const gigs = useMemo(() => getGigs().filter((g) => g.sellerId === sellerId), [sellerId, editingId]);

  useEffect(() => {
    if (subcategory !== "Other") setOtherSub("");
  }, [subcategory]);

  const subcats = categories[category as keyof typeof categories];

  function handleExtraChange(idx: number, key: keyof PackageTier["extras"], enabled: boolean, price?: number) {
    setPackages((prev) => {
      const next = [...prev];
      const p = { ...next[idx] };
      const ex = { ...(p.extras || {}) } as PackageTier["extras"];
      if (!enabled) delete ex[key]; else ex[key] = Math.max(0, Number(price ?? ex[key] ?? 0));
      next[idx] = { ...p, extras: ex };
      return next;
    });
  }

  function updatePkg(idx: number, patch: Partial<PackageTier>) {
    setPackages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  async function toDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onPickThumbnail(file?: File | null) {
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    setThumbnail(dataUrl);
  }

  async function onPickGallery(files: FileList | null) {
    if (!files || !files.length) return;
    const list: { url: string; type: "image" | "video" }[] = [];
    for (const f of Array.from(files)) {
      const url = await toDataUrl(f);
      const type = f.type.startsWith("video") ? "video" : "image";
      list.push({ url, type });
    }
    setGallery((g) => [...g, ...list]);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCategory("Design");
    setSubcategory("Logo Design");
    setOtherSub("");
    setDesc("<p>Describe your gig...</p>");
    setSkills([]);
    setRequirements([]);
    setThumbnail(undefined);
    setGallery([]);
    setPackages(packageNames.map((name) => ({ name, price: 0, deliveryDays: 7, revisions: 1, extras: {} })));
  }

  function loadGig(g: Gig) {
    setEditingId(g.id);
    setTitle(g.title);
    setCategory(g.category);
    setSubcategory(g.subcategory);
    setDesc(g.descriptionHtml);
    setSkills(g.skills);
    setRequirements(g.requirements);
    setThumbnail(g.thumbnail);
    setGallery(g.gallery || []);
    setPackages(g.packages);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id: string) {
    deleteGig(id);
    resetForm();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sub = subcategory === "Other" && otherSub.trim() ? otherSub.trim() : subcategory;
    const gig: Gig = {
      id: editingId || `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
      sellerId,
      title: title.trim(),
      category,
      subcategory: sub,
      descriptionHtml: desc,
      skills,
      packages,
      requirements,
      thumbnail,
      gallery,
    };
    upsertGig(gig);
    setEditingId(gig.id);
  }

  return (
    <GateSeller>
      <section className="container py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Gigs</h1>
          <p className="text-muted-foreground">Create new gigs and manage your listings.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gig Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(categories[v as keyof typeof categories][0]); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subcategory</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subcats.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {subcategory === "Other" && (
                <div className="grid gap-2">
                  <Label>Other Subcategory</Label>
                  <Input value={otherSub} onChange={(e) => setOtherSub(e.target.value)} />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Description (rich text)</Label>
              <RichTextEditor value={desc} onChange={setDesc} />
            </div>

            <MultiInput label="Skills" placeholder="e.g. React, Figma" values={skills} onChange={setSkills} />

            <div>
              <Label>Pricing</Label>
              <div className="mt-3 overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-4 gap-2">
                  <div />
                  {packages.map((p, i) => (
                    <div key={p.name} className="text-center font-semibold rounded bg-secondary px-3 py-2">{p.name}</div>
                  ))}
                  <div className="py-3 font-medium">Price (USD)</div>
                  {packages.map((p, i) => (
                    <div key={p.name+"price"} className="p-2"><Input type="number" min={0} value={p.price} onChange={(e) => updatePkg(i, { price: Number(e.target.value) })} /></div>
                  ))}

                  <div className="py-3 font-medium">Delivery Days</div>
                  {packages.map((p, i) => (
                    <div key={p.name+"days"} className="p-2">
                      <Select value={String(p.deliveryDays)} onValueChange={(v) => updatePkg(i, { deliveryDays: Number(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }).map((_, d) => (
                            <SelectItem key={d+1} value={String(d+1)}>{d+1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  <div className="py-3 font-medium">Revisions</div>
                  {packages.map((p, i) => (
                    <div key={p.name+"rev"} className="p-2"><Input type="number" min={0} value={p.revisions} onChange={(e) => updatePkg(i, { revisions: Number(e.target.value) })} /></div>
                  ))}

                  {["mockup","sourceFile","socialKit","extraFast"].map((extraKey) => (
                    <>
                      <div key={extraKey+"lbl"} className="py-3 font-medium capitalize">
                        {extraKey === "mockup" && "3D Mockup"}
                        {extraKey === "sourceFile" && "Source File"}
                        {extraKey === "socialKit" && "Social Media Kit"}
                        {extraKey === "extraFast" && "Extra Fast Delivery Price"}
                      </div>
                      {packages.map((p, i) => {
                        const enabled = (p.extras as any)[extraKey] != null;
                        const price = (p.extras as any)[extraKey] ?? 0;
                        return (
                          <div key={p.name+extraKey} className="p-2">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={enabled} onCheckedChange={(c) => handleExtraChange(i, extraKey as any, Boolean(c))} />
                              <Input type="number" min={0} value={price} onChange={(e) => handleExtraChange(i, extraKey as any, true, Number(e.target.value))} disabled={!enabled} className="max-w-[140px]" />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Requirements</Label>
              <MultiInput label="Questions" placeholder="Add a question" values={requirements} onChange={setRequirements} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Thumbnail</Label>
                <Input type="file" accept="image/*" onChange={(e) => onPickThumbnail(e.target.files?.[0] || null)} />
                {thumbnail && <img src={thumbnail} alt="thumbnail" className="mt-2 h-40 w-40 object-cover rounded" />}
              </div>
              <div className="grid gap-2">
                <Label>Gallery (images/videos)</Label>
                <Input type="file" accept="image/*,video/*" multiple onChange={(e) => onPickGallery(e.target.files)} />
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {gallery.map((m, idx) => (
                      m.type === "image" ? (
                        <img key={idx} src={m.url} className="h-24 w-full object-cover rounded" />
                      ) : (
                        <video key={idx} src={m.url} className="h-24 w-full object-cover rounded" muted controls />
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update Gig" : "Create Gig"}</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => resetForm()}>New Gig</Button>}
            </div>
          </form>

          <div className="mt-12">
            <h2 className="text-2xl font-bold">My Gigs</h2>
            {gigs.length === 0 ? (
              <p className="text-muted-foreground mt-2">No gigs yet. Create your first one above.</p>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gigs.map((g) => (
                  <div key={g.id} className="rounded-lg border bg-white/60 overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                    {g.thumbnail ? (
                      <img src={g.thumbnail} alt={g.title} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-br from-purple-200 to-purple-50" />
                    )}
                    <div className="p-4">
                      <div className="font-semibold line-clamp-1">{g.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{g.category} • {g.subcategory}</div>
                      {g.rating && <div className="text-xs mt-1">Rating: {g.rating} ⭐</div>}
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => loadGig(g)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(g.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </GateSeller>
  );
}
