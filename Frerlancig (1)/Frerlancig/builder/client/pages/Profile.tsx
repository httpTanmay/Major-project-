import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile, getUserProfile, saveUserProfile } from "@/lib/storage";

const LANG_OPTIONS = ["Marathi", "Hindi", "English", "Japanese", "German", "Others"] as const;

async function toDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile() || { fullName: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [languages, setLanguages] = useState<string[]>(() => profile.languages || []);
  const [otherLanguage, setOtherLanguage] = useState("");

  useEffect(() => setLanguages(profile.languages || []), [profile.languages]);

  async function onPickPhoto(file?: File | null) {
    if (!file) return;
    const data = await toDataUrl(file);
    setProfile((p) => ({ ...p, photo: data }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = { ...profile, languages };
    saveUserProfile(next);
    setProfile(next);
    setEditing(false);
  }

  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="container py-10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.photo ? (
              <img src={profile.photo} className="size-20 rounded-full object-cover" />
            ) : (
              <div className="size-20 rounded-full bg-gradient-to-br from-purple-500 to-primary" />)
            }
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs shadow">
              Edit
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0] || null)} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{profile.fullName || "Your Name"}</h1>
            <p className="text-muted-foreground">{profile.email || "no-email@example.com"}</p>
          </div>
          <div className="ml-auto">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={save} className="mt-8 grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Input value={profile.country || ""} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input value={profile.website || ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
              </div>
              <div className="grid gap-2">
                <Label>Profile Photo</Label>
                <Input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Languages</Label>
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div className="grid gap-2">
                  <Select onValueChange={(val) => { if (val === "Others") return; setLanguages((p) => Array.from(new Set([...p, val]))); }}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      {LANG_OPTIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Input value={otherLanguage} onChange={(e) => setOtherLanguage(e.target.value)} placeholder="Custom language" />
                    <Button type="button" onClick={() => { if (!otherLanguage.trim()) return; setLanguages((p) => Array.from(new Set([...p, otherLanguage.trim()]))); setOtherLanguage(""); }}>Add</Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                    {l}
                    <button className="text-muted-foreground" onClick={(e) => { e.preventDefault(); setLanguages(languages.filter((x) => x !== l)); }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                      {v}
                      <button className="text-muted-foreground" onClick={(e) => { e.preventDefault(); const next = (profile.skills || []).slice(); next.splice(i,1); setProfile({ ...profile, skills: next }); }}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Add a skill" onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (!val) return; const set = new Set([...(profile.skills || []), val]); setProfile({ ...profile, skills: Array.from(set) }); (e.target as HTMLInputElement).value = ""; }
                  }} />
                  <Button type="button" onClick={() => {
                    const inp = (document.activeElement as HTMLInputElement); const val = inp?.value?.trim(); if (!val) return; const set = new Set([...(profile.skills || []), val]); setProfile({ ...profile, skills: Array.from(set) }); inp.value = "";
                  }}>Add</Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Previous Projects</Label>
                {(profile.projects || []).map((p, idx) => (
                  <div key={idx} className="grid md:grid-cols-3 gap-3 items-end">
                    <div className="grid gap-2">
                      <Label>Image</Label>
                      <Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const img = await toDataUrl(f); const next = [...(profile.projects || [])]; next[idx] = { ...(next[idx] || {}), image: img }; setProfile({ ...profile, projects: next }); }} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Link</Label>
                      <Input value={p.link || ""} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...(next[idx] || {}), link: e.target.value }; setProfile({ ...profile, projects: next }); }} placeholder="https://" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Input value={p.description || ""} onChange={(e) => { const next = [...(profile.projects || [])]; next[idx] = { ...(next[idx] || {}), description: e.target.value }; setProfile({ ...profile, projects: next }); }} />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setProfile({ ...profile, projects: [...(profile.projects || []), {}] })}>Add More</Button>
              </div>

              <div className="grid gap-2">
                <Label>Certifications</Label>
                {(profile.certifications || []).map((c, idx) => (
                  <div key={idx} className="grid md:grid-cols-3 gap-3">
                    <Input placeholder="Certificate Name" value={c.name} onChange={(e) => { const next = [...(profile.certifications || [])]; next[idx] = { ...(next[idx] || {}), name: e.target.value }; setProfile({ ...profile, certifications: next }); }} />
                    <Input placeholder="Issued By" value={c.by} onChange={(e) => { const next = [...(profile.certifications || [])]; next[idx] = { ...(next[idx] || {}), by: e.target.value }; setProfile({ ...profile, certifications: next }); }} />
                    <Input placeholder="Year" value={c.year} onChange={(e) => { const next = [...(profile.certifications || [])]; next[idx] = { ...(next[idx] || {}), year: e.target.value }; setProfile({ ...profile, certifications: next }); }} />
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setProfile({ ...profile, certifications: [...(profile.certifications || []), { name: "", by: "", year: "" }] })}>Add More</Button>
              </div>

              <div className="grid gap-2">
                <Label>Education</Label>
                {(profile.education || []).map((ed, idx) => (
                  <div key={idx} className="grid md:grid-cols-3 gap-3">
                    <Input placeholder="College" value={ed.college} onChange={(e) => { const next = [...(profile.education || [])]; next[idx] = { ...(next[idx] || {}), college: e.target.value }; setProfile({ ...profile, education: next }); }} />
                    <Input placeholder="Degree" value={ed.degree} onChange={(e) => { const next = [...(profile.education || [])]; next[idx] = { ...(next[idx] || {}), degree: e.target.value }; setProfile({ ...profile, education: next }); }} />
                    <Input placeholder="Year of Passing" value={ed.year} onChange={(e) => { const next = [...(profile.education || [])]; next[idx] = { ...(next[idx] || {}), year: e.target.value }; setProfile({ ...profile, education: next }); }} />
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setProfile({ ...profile, education: [...(profile.education || []), { college: "", degree: "", year: "" }] })}>Add More</Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        ) : (
          <div className="mt-8 grid gap-4">
            <div className="rounded-lg border p-4 bg-white/60 grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Country</div>
                <div className="font-medium">{profile.country || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{profile.phone || "—"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-muted-foreground">Website</div>
                {profile.website ? <a className="font-medium text-primary underline" href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a> : <div className="font-medium">—</div>}
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-white/60">
              <div className="text-sm text-muted-foreground">Languages</div>
              {profile.languages && profile.languages.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.languages.map((l, i) => (<span key={i} className="rounded-full bg-secondary px-3 py-1 text-sm">{l}</span>))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">—</div>
              )}
            </div>
            <div className="rounded-lg border p-4 bg-white/60">
              <div className="text-sm text-muted-foreground">Skills</div>
              {profile.skills && profile.skills.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.skills.map((s, i) => (<span key={i} className="rounded-full bg-secondary px-3 py-1 text-sm">{s}</span>))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">—</div>
              )}
            </div>
            <div className="rounded-lg border p-4 bg-white/60">
              <div className="text-sm text-muted-foreground">Previous Projects</div>
              {profile.projects && profile.projects.length ? (
                <div className="mt-2 grid md:grid-cols-2 gap-3">
                  {profile.projects.map((p, i) => (
                    <div key={i} className="rounded border p-2 bg-white">
                      {p.image ? <img src={p.image} className="h-28 w-full object-cover rounded" /> : <div className="h-28 w-full bg-secondary rounded" />}
                      <div className="mt-2 text-sm">
                        {p.link ? <a href={p.link} className="text-primary underline break-words" target="_blank" rel="noreferrer">{p.link}</a> : <span className="text-muted-foreground">No link</span>}
                      </div>
                      {p.description && <div className="text-xs text-muted-foreground mt-1">{p.description}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">—</div>
              )}
            </div>
            <div className="rounded-lg border p-4 bg-white/60">
              <div className="text-sm text-muted-foreground">Certifications</div>
              {profile.certifications && profile.certifications.length ? (
                <ul className="mt-2 text-sm list-disc pl-5">
                  {profile.certifications.map((c, i) => (<li key={i}><span className="font-medium">{c.name}</span> • {c.by} • {c.year}</li>))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">—</div>
              )}
            </div>
            <div className="rounded-lg border p-4 bg-white/60">
              <div className="text-sm text-muted-foreground">Education</div>
              {profile.education && profile.education.length ? (
                <ul className="mt-2 text-sm list-disc pl-5">
                  {profile.education.map((e, i) => (<li key={i}><span className="font-medium">{e.degree}</span> • {e.college} • {e.year}</li>))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">—</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
