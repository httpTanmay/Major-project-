import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type Role = "buyer" | "seller";

function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-6 bg-white/60">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
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

function FileList({ files }: { files: File[] }) {
  if (!files.length) return null;
  return (
    <ul className="text-sm text-muted-foreground list-disc pl-5">
      {files.map((f, i) => (
        <li key={i}>{f.name}</li>
      ))}
    </ul>
  );
}

export default function Register() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("India");

  // Onboarding fields (seller only)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerCountry, setSellerCountry] = useState("India");
  const occupations = ["Designer", "Developer", "Marketer", "Writer", "Consultant", "Other"];
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [otherOccupation, setOtherOccupation] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const languageOptions = ["Marathi", "Hindi", "English", "Japanese", "German", "Others"];
  const [languages, setLanguages] = useState<string[]>([]);
  const [otherLanguage, setOtherLanguage] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [projects, setProjects] = useState<{ image?: File | null; link?: string; description?: string }[]>([]);
  const [certs, setCerts] = useState<{ name: string; by: string; year: string }[]>([]);
  const [education, setEducation] = useState<{ college: string; degree: string; year: string }[]>([]);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);

  const canContinue = useMemo(() => {
    return firstName && lastName && email && password && country && role;
  }, [firstName, lastName, email, password, country, role]);

  const startRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setLoading(true);

    const { data, error } = await signUp(email, password, {
      full_name: `${firstName} ${lastName}`.trim(),
      role: role,
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: data.user.id,
        email: email,
        role: role,
        full_name: `${firstName} ${lastName}`.trim(),
        country: country,
      });

      if (dbError) {
        toast({
          title: "Error",
          description: "Failed to create user profile",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: role === "seller" ? "Please complete your profile" : "Account created successfully",
      });

      if (role === "seller") {
        setStep(2);
        setLoading(false);
      } else {
        navigate("/explore");
      }
    }
  };

  const finishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.from('users').update({
      full_name: fullName,
      phone: phone,
      country: sellerCountry,
      bio: skills.join(', '),
      website: '',
    }).eq('id', user.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (skills.length > 0) {
        const { error } = await supabase.from('user_skills').insert(
          skills.map(skill => ({ user_id: user.id, skill }))
        );
        if (error) throw new Error(`Failed to save skills: ${error.message}`);
      }

      if (languages.length > 0) {
        const { error } = await supabase.from('user_languages').insert(
          languages.map(lang => ({ user_id: user.id, language: lang }))
        );
        if (error) throw new Error(`Failed to save languages: ${error.message}`);
      }

      if (certs.length > 0) {
        const validCerts = certs.filter(cert => cert.name);
        if (validCerts.length > 0) {
          const { error } = await supabase.from('user_certifications').insert(
            validCerts.map(cert => ({
              user_id: user.id,
              name: cert.name,
              issued_by: cert.by,
              year: cert.year
            }))
          );
          if (error) throw new Error(`Failed to save certifications: ${error.message}`);
        }
      }

      if (education.length > 0) {
        const validEducation = education.filter(edu => edu.college);
        if (validEducation.length > 0) {
          const { error } = await supabase.from('user_education').insert(
            validEducation.map(edu => ({
              user_id: user.id,
              college: edu.college,
              degree: edu.degree,
              year: edu.year
            }))
          );
          if (error) throw new Error(`Failed to save education: ${error.message}`);
        }
      }

      toast({
        title: "Profile Complete!",
        description: "Your seller profile has been created successfully",
      });

      navigate("/gigs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-purple-50">
      <section className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2">Select your role and complete registration.</p>

          {step === 1 && (
            <form onSubmit={startRegistration} className="mt-8 grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button type="button" onClick={() => setRole("buyer")} className={"rounded-lg border p-4 text-left hover:border-primary transition " + (role === "buyer" ? "border-primary ring-2 ring-primary/20" : "") }>
                  <div className="font-semibold">I'm a Client, hiring for a project</div>
                  <p className="text-sm text-muted-foreground mt-1">Find the right freelancer for your job.</p>
                </button>
                <button type="button" onClick={() => setRole("seller")} className={"rounded-lg border p-4 text-left hover:border-primary transition " + (role === "seller" ? "border-primary ring-2 ring-primary/20" : "") }>
                  <div className="font-semibold">I'm a Freelancer, looking for work</div>
                  <p className="text-sm text-muted-foreground mt-1">Showcase your skills and get hired.</p>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first">First Name</Label>
                  <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last">Last Name</Label>
                  <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['India','USA','UK','Germany','Japan','Canada','Australia'].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</div>
                <Button type="submit" disabled={!canContinue || loading}>
                  {loading ? "Creating account..." : "Continue"}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && role === "seller" && (
            <form onSubmit={finishOnboarding} className="mt-8 grid gap-8">
              <Section title="Personal Details">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone Number</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <Select value={sellerCountry} onValueChange={setSellerCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {['India','USA','UK','Germany','Japan','Canada','Australia'].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Section>

              <Section title="Occupation">
                <div className="grid md:grid-cols-2 gap-4 items-end">
                  <div className="grid gap-2">
                    <Label>Choose Occupations</Label>
                    <Select onValueChange={(val) => setSelectedOccupations((p) => Array.from(new Set([...p, val])))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupations.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOccupations.map((o, i) => (
                        <span key={i} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                          {o}
                          <button className="text-muted-foreground" onClick={(e) => { e.preventDefault(); setSelectedOccupations(selectedOccupations.filter((x) => x !== o)); }}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedOccupations.includes("Other") && (
                    <div className="grid gap-2">
                      <Label>Other Occupation</Label>
                      <Input value={otherOccupation} onChange={(e) => setOtherOccupation(e.target.value)} />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label>Experience Years</Label>
                    <Input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                  </div>
                </div>
              </Section>

              <Section title="Languages">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                      <Label>Add Language</Label>
                      <Select onValueChange={(val) => {
                        if (val === "Others") return; // show input below
                        setLanguages((p) => Array.from(new Set([...p, val])));
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Custom Language (on selecting "Others")</Label>
                      <div className="flex gap-2">
                        <Input value={otherLanguage} onChange={(e) => setOtherLanguage(e.target.value)} placeholder="e.g., Tamil" />
                        <Button type="button" onClick={() => { if (!otherLanguage.trim()) return; setLanguages((p) => Array.from(new Set([...p, otherLanguage.trim()]))); setOtherLanguage(""); }}>Add</Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l, i) => (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                        {l}
                        <button className="text-muted-foreground" onClick={(e) => { e.preventDefault(); setLanguages(languages.filter((x) => x !== l)); }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Skills">
                <MultiInput label="Add Skills" placeholder="e.g. React, Figma" values={skills} onChange={setSkills} />
              </Section>

              <Section title="Previous Projects" description="Upload image, add link and description for each project.">
                <div className="grid gap-6">
                  {projects.map((p, idx) => (
                    <div key={idx} className="grid md:grid-cols-3 gap-4 items-end">
                      <div className="grid gap-2">
                        <Label>Image</Label>
                        <Input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          const next = [...projects];
                          next[idx] = { ...next[idx], image: file ?? undefined };
                          setProjects(next);
                        }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Link</Label>
                        <Input value={p.link ?? ""} onChange={(e) => { const next = [...projects]; next[idx] = { ...next[idx], link: e.target.value }; setProjects(next); }} placeholder="https://" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input value={p.description ?? ""} onChange={(e) => { const next = [...projects]; next[idx] = { ...next[idx], description: e.target.value }; setProjects(next); }} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => setProjects((p) => [...p, {}])}>Add More</Button>
                </div>
              </Section>

              <Section title="Certifications">
                <div className="grid gap-6">
                  {certs.map((c, idx) => (
                    <div key={idx} className="grid md:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Certificate Name</Label>
                        <Input value={c.name} onChange={(e) => { const next = [...certs]; next[idx] = { ...next[idx], name: e.target.value }; setCerts(next); }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Issued By</Label>
                        <Input value={c.by} onChange={(e) => { const next = [...certs]; next[idx] = { ...next[idx], by: e.target.value }; setCerts(next); }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Year</Label>
                        <Input value={c.year} onChange={(e) => { const next = [...certs]; next[idx] = { ...next[idx], year: e.target.value }; setCerts(next); }} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => setCerts((p) => [...p, { name: "", by: "", year: "" }])}>Add More</Button>
                </div>
              </Section>

              <Section title="Education">
                <div className="grid gap-6">
                  {education.map((ed, idx) => (
                    <div key={idx} className="grid md:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>College</Label>
                        <Input value={ed.college} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], college: e.target.value }; setEducation(next); }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Degree</Label>
                        <Input value={ed.degree} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], degree: e.target.value }; setEducation(next); }} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Year of Passing</Label>
                        <Input value={ed.year} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], year: e.target.value }; setEducation(next); }} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => setEducation((p) => [...p, { college: "", degree: "", year: "" }])}>Add More</Button>
                </div>
              </Section>

              <Section title="Seller Account Details" description="Upload identity proof, registrations, certifications, etc.">
                <div className="grid gap-2">
                  <Input type="file" multiple onChange={(e) => setSellerDocs(Array.from(e.target.files ?? []))} />
                  <FileList files={sellerDocs} />
                </div>
              </Section>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving profile..." : "Finish Onboarding"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
