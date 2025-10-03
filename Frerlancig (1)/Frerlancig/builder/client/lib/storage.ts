export type PackageName = "Basic" | "Standard" | "Premium";

export interface PackageTier {
  name: PackageName;
  price: number;
  deliveryDays: number;
  revisions: number;
  extras: {
    mockup?: number;
    sourceFile?: number;
    socialKit?: number;
    extraFast?: number;
  };
}

export interface GigMedia {
  url: string; // data URL for images/videos
  type: "image" | "video";
}

export interface Gig {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  subcategory: string;
  descriptionHtml: string;
  skills: string[];
  packages: PackageTier[];
  requirements: string[];
  thumbnail?: string; // data URL
  gallery?: GigMedia[];
  rating?: number;
}

export interface BillingEntry {
  date: string; // ISO
  document: string; // Invoice, Receipt, Order Confirmation
  service: string;
  order: string;
  currency: string; // USD, EUR, INR
  total: number;
}

export interface PaymentMethod {
  provider: string; // e.g. PayPal, Stripe
  account: string;
}

export interface UserProject { image?: string; link?: string; description?: string }
export interface UserCertification { name: string; by: string; year: string }
export interface UserEducation { college: string; degree: string; year: string }

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  photo?: string; // data URL
  languages?: string[];
  website?: string;
  skills?: string[];
  projects?: UserProject[];
  certifications?: UserCertification[];
  education?: UserEducation[];
}

export function getUserProfile(): UserProfile | null {
  try {
    const saved = JSON.parse(localStorage.getItem("userProfile") || "null");
    if (saved) return saved as UserProfile;
  } catch {}
  try {
    const onboarding = JSON.parse(localStorage.getItem("onboarding") || "null");
    if (onboarding?.profile) {
      const p = onboarding.profile;
      const projects: UserProject[] = (p.projects || []).map((pr: any) => ({ image: undefined, link: pr.link, description: pr.description }));
      return { fullName: p.fullName || "", email: p.email || "", country: p.country, languages: p.languages || [], skills: p.skills || [], projects, certifications: p.certifications || [], education: p.education || [] };
    }
  } catch {}
  try {
    const reg = JSON.parse(localStorage.getItem("registration") || "null");
    if (reg) {
      return { fullName: `${reg.firstName || ""} ${reg.lastName || ""}`.trim(), email: reg.email || "", country: reg.country } as UserProfile;
    }
  } catch {}
  return null;
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

export function ensureUserId(): string {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    localStorage.setItem("userId", id);
  }
  return id;
}

export function getRole(): "buyer" | "seller" | null {
  try {
    return JSON.parse(localStorage.getItem("role") || "null");
  } catch {
    return null;
  }
}

export function getGigs(): Gig[] {
  try {
    return JSON.parse(localStorage.getItem("gigs") || "[]");
  } catch {
    return [];
  }
}

export function saveGigs(gigs: Gig[]) {
  localStorage.setItem("gigs", JSON.stringify(gigs));
}

export function upsertGig(gig: Gig) {
  const gigs = getGigs();
  const idx = gigs.findIndex((g) => g.id === gig.id);
  if (idx >= 0) gigs[idx] = gig; else gigs.push(gig);
  saveGigs(gigs);
}

export function deleteGig(id: string) {
  saveGigs(getGigs().filter((g) => g.id !== id));
}

export function getBilling(): BillingEntry[] {
  try {
    const existing = JSON.parse(localStorage.getItem("billingHistory") || "null");
    if (existing) return existing;
  } catch {}
  const seed: BillingEntry[] = [
    { date: new Date().toISOString(), document: "Invoice", service: "Logo Design", order: "#1001", currency: "USD", total: 200 },
    { date: new Date(Date.now()-1000*60*60*24*35).toISOString(), document: "Receipt", service: "Landing Page", order: "#1000", currency: "USD", total: 1200 },
  ];
  localStorage.setItem("billingHistory", JSON.stringify(seed));
  return seed;
}

export function saveBilling(rows: BillingEntry[]) {
  localStorage.setItem("billingHistory", JSON.stringify(rows));
}

export function getPaymentMethods(): PaymentMethod[] {
  try {
    const data = JSON.parse(localStorage.getItem("paymentMethods") || "null");
    if (data) return data;
  } catch {}
  const seed: PaymentMethod[] = [
    { provider: "PayPal", account: "seller@example.com" },
    { provider: "Stripe", account: "acct_1234" },
  ];
  localStorage.setItem("paymentMethods", JSON.stringify(seed));
  return seed;
}

export function savePaymentMethods(methods: PaymentMethod[]) {
  localStorage.setItem("paymentMethods", JSON.stringify(methods));
}
