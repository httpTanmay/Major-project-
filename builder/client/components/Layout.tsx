import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type Role = "buyer" | "seller" | null;

function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="size-8 rounded-md bg-gradient-to-br from-primary to-purple-500 animate-float-slow group-hover:shadow-md transition-shadow" />
      <span className="text-lg font-extrabold tracking-tight">WorkForge</span>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [role, setRole] = usePersistedState<Role>("role", null);
  const [loggedIn, setLoggedIn] = usePersistedState<boolean>("loggedIn", false);

  const menu = useMemo(() => {
    if (!loggedIn) return [] as { to: string; label: string }[];
    if (role === "seller")
      return [
        { to: "/gigs", label: "Gigs" },
        { to: "/orders", label: "Orders" },
        { to: "/earnings", label: "Earnings" },
        { to: "/billing", label: "Billing & Payments" },
      ];
    return [
      { to: "/explore", label: "Explore" },
      { to: "/messages", label: "Messages" },
      { to: "/profile", label: "Account" },
    ];
  }, [loggedIn, role]);

  const onLogout = () => {
    setLoggedIn(false);
    setRole(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(1200px_600px_at_100%_-10%,theme(colors.purple.100),transparent)]">
      <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="container flex h-16 items-center justify-between">
          <Brand />
          <nav className="hidden md:flex items-center gap-6">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-8 decoration-2",
                    isActive && "text-foreground",
                  )
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <>
                {role === "seller" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="hidden sm:inline-flex"
                      >
                        My Business
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Seller</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/orders">Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/gigs">Gigs</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/earnings">Earnings</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Account</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Session</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link to="/#login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} WorkForge</p>
          <div className="flex gap-4">
            <a className="hover:text-foreground" href="#">
              Privacy
            </a>
            <a className="hover:text-foreground" href="#">
              Terms
            </a>
            <a className="hover:text-foreground" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
