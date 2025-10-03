import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillingEntry, PaymentMethod, getBilling, getPaymentMethods, getRole, saveBilling, savePaymentMethods } from "@/lib/storage";

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

export default function Billing() {
  const [rows, setRows] = useState<BillingEntry[]>(getBilling());
  const [methods, setMethods] = useState<PaymentMethod[]>(getPaymentMethods());

  const [dateRange, setDateRange] = useState<string>("30");
  const [docType, setDocType] = useState<string>("All");
  const [currency, setCurrency] = useState<string>("USD");

  const filtered = useMemo(() => {
    const now = Date.now();
    const min = dateRange === "90" ? now - 1000*60*60*24*90 : dateRange === "30" ? now - 1000*60*60*24*30 : 0;
    return rows.filter(r => (min ? new Date(r.date).getTime() >= min : true) && (docType === "All" || r.document === docType) && (currency ? r.currency === currency : true));
  }, [rows, dateRange, docType, currency]);

  function addMethod(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const provider = (form.elements.namedItem("provider") as HTMLInputElement).value.trim();
    const account = (form.elements.namedItem("account") as HTMLInputElement).value.trim();
    if (!provider || !account) return;
    const next = [...methods, { provider, account }];
    setMethods(next); savePaymentMethods(next);
    form.reset();
  }

  return (
    <GateSeller>
      <section className="container py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">View billing history and manage payment methods.</p>

          <div className="mt-8 rounded-lg border bg-white/60 p-4">
            <h2 className="text-xl font-semibold">Billing History</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="all">Custom/All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All','Invoice','Receipt','Order Confirmation'].map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['USD','EUR','INR'].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[700px] w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Document</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Currency</th>
                    <th className="py-2 pr-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">{r.document}</td>
                      <td className="py-2 pr-4">{r.service}</td>
                      <td className="py-2 pr-4">{r.order}</td>
                      <td className="py-2 pr-4">{r.currency}</td>
                      <td className="py-2 pr-4 text-right font-medium">{r.total.toLocaleString(undefined,{ style:'currency', currency: r.currency })}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No results</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-white/60 p-4">
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {methods.map((m,i) => (
                  <li key={i} className="flex items-center justify-between rounded border p-2 bg-white/70">
                    <div>
                      <div className="font-medium">{m.provider}</div>
                      <div className="text-muted-foreground">{m.account}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-white/60 p-4">
              <h2 className="text-xl font-semibold">Add Payment Method</h2>
              <form onSubmit={addMethod} className="mt-3 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input id="provider" name="provider" placeholder="e.g., PayPal, Stripe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account">Account</Label>
                  <Input id="account" name="account" placeholder="email or account id" required />
                </div>
                <Button type="submit">Add Method</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </GateSeller>
  );
}
