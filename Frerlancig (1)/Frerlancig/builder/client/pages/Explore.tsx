import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getFreelancers } from "@/lib/freelancers";

export default function Explore() {
  const freelancers = getFreelancers();
  return (
    <section className="container py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Freelancers</h1>
        <p className="text-muted-foreground">Browse featured and general freelancers.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.map((f) => (
            <div key={f.id} className="rounded-lg border bg-white/60 p-4 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-primary" />
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.occupations[0] || 'Freelancer'}</div>
                </div>
              </div>
              <div className="mt-3 text-xs">Rating: <span className="font-medium">{f.rating.toFixed(1)}</span> ⭐</div>
              <Button asChild className="mt-3 w-full">
                <Link to={`/freelancer/${encodeURIComponent(f.id)}`}>View Profile</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
