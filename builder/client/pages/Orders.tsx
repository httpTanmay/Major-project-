import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRole } from "@/lib/storage";

function GateSeller({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (role !== "seller")
    return (
      <section className="container py-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Seller only</h1>
          <p className="mt-2 text-muted-foreground">This section is only available to sellers.</p>
        </div>
      </section>
    );
  return <>{children}</>;
}

const CATEGORIES = ["Priority","Late","Delivered","Completed","Cancelled"] as const;

type Category = typeof CATEGORIES[number];

type Order = {
  id: string;
  category: Category;
  buyer: string;
  gig: string;
  dueOn: string; // ISO date
  note?: string;
  status: string;
};

function seedOrders(): Order[] {
  try { const s = JSON.parse(localStorage.getItem("orders") || "null"); if (s) return s; } catch {}
  const now = Date.now();
  const rows: Order[] = [
    { id: "o1", category: "Priority", buyer: "John Doe", gig: "Logo Design", dueOn: new Date(now+86400000).toISOString(), note: "Urgent brand refresh", status: "In Progress" },
    { id: "o2", category: "Late", buyer: "Acme Inc.", gig: "Landing Page", dueOn: new Date(now-86400000*2).toISOString(), note: "Delay approved", status: "Delayed" },
    { id: "o3", category: "Delivered", buyer: "Maria G.", gig: "Social Kit", dueOn: new Date(now-86400000).toISOString(), note: "Awaiting review", status: "Delivered" },
    { id: "o4", category: "Completed", buyer: "Pixel Co", gig: "App UI", dueOn: new Date(now-86400000*10).toISOString(), status: "Completed" },
    { id: "o5", category: "Cancelled", buyer: "Byte Ltd", gig: "SEO Audit", dueOn: new Date(now+86400000*5).toISOString(), note: "Client cancelled", status: "Cancelled" },
  ];
  localStorage.setItem("orders", JSON.stringify(rows));
  return rows;
}

export default function Orders() {
  const [orders] = useState<Order[]>(seedOrders());
  const [category, setCategory] = useState<Category>("Priority");

  const filtered = useMemo(() => orders.filter(o => o.category === category), [orders, category]);

  return (
    <GateSeller>
      <section className="container py-10 animate-fade-up">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">View and manage your orders by category.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button key={c} variant={c===category?"default":"secondary"} onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-4">Buyer</th>
                  <th className="py-2 pr-4">Gig</th>
                  <th className="py-2 pr-4">Due on</th>
                  <th className="py-2 pr-4">Note</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr]:transition-colors [&_tr:hover]:bg-accent/30">
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{o.buyer}</td>
                    <td className="py-2 pr-4">{o.gig}</td>
                    <td className="py-2 pr-4">{new Date(o.dueOn).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{o.note || "—"}</td>
                    <td className="py-2 pr-4">{o.status}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No orders in this category</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </GateSeller>
  );
}
