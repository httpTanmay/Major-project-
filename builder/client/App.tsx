import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Layout from "@/components/Layout";
import Placeholder from "@/components/Placeholder";
import Register from "@/pages/Register";
import Explore from "@/pages/Explore";
import Gigs from "@/pages/Gigs";
import Billing from "@/pages/Billing";
import Orders from "@/pages/Orders";
import Earnings from "@/pages/Earnings";
import FreelancerProfile from "@/pages/FreelancerProfile";
import GigDetails from "@/pages/GigDetails";
import Profile from "@/pages/Profile";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />

          {/* Placeholder routes so there are no dead links */}
          <Route path="/explore" element={<Layout><Explore /></Layout>} />
          <Route path="/gigs" element={<Layout><Gigs /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/earnings" element={<Layout><Earnings /></Layout>} />
          <Route path="/billing" element={<Layout><Billing /></Layout>} />
          <Route path="/messages" element={<Layout><Placeholder title="Messages" description="Chat between buyers and freelancers." /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/freelancer/:id" element={<Layout><FreelancerProfile /></Layout>} />
          <Route path="/gig/:id" element={<Layout><GigDetails /></Layout>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
