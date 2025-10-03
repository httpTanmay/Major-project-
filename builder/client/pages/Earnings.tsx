import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBilling } from "@/lib/storage";

export default function Earnings() {
  const billing = getBilling();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const filtered = useMemo(() => {
    const f = from ? new Date(from).getTime() : -Infinity;
    const t = to ? new Date(to).getTime() : Infinity;
    return billing.filter((b) => {
      const d = new Date(b.date).getTime();
      return d >= f && d <= t;
    });
  }, [billing, from, to]);

  const total = useMemo(() => filtered.reduce((sum, r) => sum + r.total, 0), [filtered]);

  function downloadStatement() {
    const rows = [
      ["Date","Document","Service","Order","Currency","Total"],
      ...filtered.map((r) => [new Date(r.date).toLocaleDateString(), r.document, r.service, r.order, r.currency, String(r.total)])
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "earnings-statement.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="container py-10 animate-fade-up">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">Earnings</h1>
        <div className="mt-2 text-2xl font-extrabold">${total.toLocaleString()}</div>

        <div className="mt-6 rounded-lg border p-4 bg-white/60">
          <div className="text-sm text-muted-foreground">Choose a date range and download a statement summarizing your yearly earnings.</div>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <Button className="w-full" onClick={downloadStatement}>Download Statement</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
