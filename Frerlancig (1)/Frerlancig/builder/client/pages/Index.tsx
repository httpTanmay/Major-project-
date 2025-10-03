import { DemoResponse } from "@shared/api";
export default function Index() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_400px_at_0%_-10%,theme(colors.purple.100),transparent)]" />
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight animate-fade-up" style={{animationDelay:'60ms'}}>Hire top freelancers. Build faster.</h1>
              <p className="mt-4 text-lg text-muted-foreground animate-fade-up" style={{animationDelay:'140ms'}}>A modern marketplace with seamless onboarding, role-based dashboards, gigs, orders, chat, and payments.</p>
              <div className="mt-6 flex flex-wrap gap-3 animate-fade-up" style={{animationDelay:'220ms'}}>
                <a href="#login" className="sr-only">skip</a>
                <a href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">Register</a>
                <a href="#login" className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium">Login</a>
              </div>
              <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
                <li className="rounded-md border p-3">Seller Dashboard: Gigs, Orders, Earnings, Billing & Payments</li>
                <li className="rounded-md border p-3">Buyer Dashboard: Explore, Messages, Account/Profile</li>
                <li className="rounded-md border p-3">Explore freelancers by skills, projects, certifications</li>
                <li className="rounded-md border p-3">Chat, project updates, and secure billing</li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-xl border bg-white/70 p-6 shadow-sm animate-fade-up" style={{animationDelay:'180ms'}}>
                <h3 className="text-lg font-semibold">Login</h3>
                <p className="text-sm text-muted-foreground">Returning users can sign in below.</p>
                <form id="login" onSubmit={(e) => { e.preventDefault(); localStorage.setItem('loggedIn', JSON.stringify(true)); window.location.assign('/profile'); }} className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="login-email">Email</label>
                    <input id="login-email" type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="login-pass">Password</label>
                    <input id="login-pass" type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
                  </div>
                  <button type="submit" className="h-10 rounded-[10px] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Sign in</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
