import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getFreelancerById } from "@/lib/freelancers";
import { Gig, ensureUserId, getGigs } from "@/lib/storage";

function saveConnection(toSellerId: string) {
  const me = ensureUserId();
  const key = "connectionRequests";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push({ id: `cr_${Date.now()}`, toSellerId, fromUserId: me, date: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(list));
}

export default function FreelancerProfile() {
  const { id = "" } = useParams();
  const profile = getFreelancerById(id);
  const gigs: Gig[] = useMemo(() => getGigs().filter((g) => g.sellerId === id), [id]);

  if (!profile) return (
    <section className="container py-24"><p>Freelancer not found.</p></section>
  );

  return (
    <section className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-6">
          <div className="size-20 rounded-full bg-gradient-to-br from-purple-500 to-primary" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.occupations.join(", ")}</p>
            {profile.country && <p className="text-sm text-muted-foreground mt-1">{profile.country}</p>}
            <div className="mt-3 flex gap-2">
              <Button onClick={() => { saveConnection(id); alert("Connection Request Sent"); }}>Connect to Freelancer</Button>
              <Button variant="secondary">Chat</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-4 bg-white/60">
            <h2 className="text-xl font-semibold">Languages</h2>
            <ul className="mt-2 text-sm list-disc pl-5">
              {profile.languages.map((l, i) => (<li key={i}>{l}</li>))}
            </ul>
          </div>
          <div className="rounded-lg border p-4 bg-white/60">
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {profile.skills.map((s, i) => (<span key={i} className="rounded-full bg-secondary px-3 py-1">{s}</span>))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border p-4 bg-white/60">
          <h2 className="text-xl font-semibold">Gigs</h2>
          {gigs.length === 0 ? (
            <p className="mt-2 text-muted-foreground">No gigs yet.</p>
          ) : (
            <div className="mt-3 grid sm:grid-cols-2 gap-4">
              {gigs.map((g) => (
                <Link to={`/gig/${g.id}`} key={g.id} className="rounded-lg border overflow-hidden bg-white">
                  {g.thumbnail ? <img src={g.thumbnail} className="h-36 w-full object-cover" /> : <div className="h-36 w-full bg-gradient-to-br from-purple-200 to-purple-50" />}
                  <div className="p-3">
                    <div className="font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{g.category} • {g.subcategory}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
