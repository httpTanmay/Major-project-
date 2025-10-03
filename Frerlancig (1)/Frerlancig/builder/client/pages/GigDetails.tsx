import { useParams } from "react-router-dom";
import { getGigs } from "@/lib/storage";

export default function GigDetails() {
  const { id = "" } = useParams();
  const gig = getGigs().find((g) => g.id === id);
  if (!gig) return <section className="container py-24"><p>Gig not found.</p></section>;

  return (
    <section className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {gig.thumbnail && (<img src={gig.thumbnail} className="w-full h-64 object-cover rounded" />)}
            {gig.gallery && gig.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {gig.gallery.map((m, i) => m.type === 'image' ? (
                  <img key={i} src={m.url} className="h-24 w-full object-cover rounded" />
                ) : (
                  <video key={i} src={m.url} className="h-24 w-full object-cover rounded" controls />
                ))}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{gig.title}</h1>
            <p className="text-sm text-muted-foreground">{gig.category} • {gig.subcategory}</p>
            <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: gig.descriptionHtml }} />

            <div className="mt-6">
              <h2 className="text-xl font-semibold">Packages</h2>
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                {gig.packages.map((p) => (
                  <div key={p.name} className="rounded-lg border p-3 bg-white/60">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm mt-1">${p.price}</div>
                    <div className="text-xs text-muted-foreground">{p.deliveryDays} days • {p.revisions} revisions</div>
                    {Object.entries(p.extras || {}).length > 0 && (
                      <ul className="text-xs list-disc pl-4 mt-2">
                        {Object.entries(p.extras).map(([k,v]) => (
                          <li key={k}>{k === 'mockup' ? '3D Mockup' : k === 'sourceFile' ? 'Source File' : k === 'socialKit' ? 'Social Media Kit' : 'Extra Fast'}: ${v}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {gig.requirements.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Requirements</h2>
                <ul className="mt-2 text-sm list-disc pl-6">
                  {gig.requirements.map((q, i) => (<li key={i}>{q}</li>))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
