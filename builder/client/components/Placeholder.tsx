import { Link, useLocation } from "react-router-dom";

export default function Placeholder({ title, description }: { title?: string; description?: string }) {
  const location = useLocation();
  return (
    <section className="container py-24">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight">{title ?? "Coming soon"}</h1>
        <p className="mt-3 text-muted-foreground">
          {description ?? `This page (${location.pathname}) is a placeholder. Tell Fusion what to build next and we will generate it here.`}
        </p>
        <div className="mt-6">
          <Link className="text-primary underline" to="/">Go back to Home</Link>
        </div>
      </div>
    </section>
  );
}
