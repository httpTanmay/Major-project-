import { ensureUserId, getGigs } from "@/lib/storage";

export interface FreelancerProfile {
  id: string; // maps to sellerId
  name: string;
  country?: string;
  occupations: string[];
  languages: string[];
  skills: string[];
  bio?: string;
  rating: number;
  website?: string;
}

export function getSampleFreelancers(): FreelancerProfile[] {
  return [
    { id: "f1", name: "Aarav Patil", occupations: ["Full-stack Developer"], languages: ["English", "Hindi"], skills: ["React","Node","Postgres"], rating: 4.9, country: "India" },
    { id: "f2", name: "Priya Sharma", occupations: ["UI/UX Designer"], languages: ["English"], skills: ["Figma","Design Systems"], rating: 4.8, country: "India" },
    { id: "f3", name: "Rahul Verma", occupations: ["Digital Marketer"], languages: ["English"], skills: ["SEO","Content"], rating: 4.7, country: "India" },
  ];
}

export function getCurrentSellerAsFreelancer(): FreelancerProfile | null {
  try {
    const onboarding = JSON.parse(localStorage.getItem("onboarding") || "null");
    if (!onboarding || onboarding.role !== "seller") return null;
    const id = ensureUserId();
    const fullName: string = onboarding.profile?.fullName || "";
    const country: string | undefined = onboarding.profile?.country;
    const occupations: string[] = onboarding.profile?.occupations || [];
    const languages: string[] = onboarding.profile?.languages || [];
    const skills: string[] = onboarding.profile?.skills || [];
    return { id, name: fullName || "You", country, occupations, languages, skills, rating: 5 };
  } catch { return null; }
}

export function getFreelancers(): FreelancerProfile[] {
  const me = getCurrentSellerAsFreelancer();
  const all = [...getSampleFreelancers()];
  if (me) {
    // Add self if not present
    if (!all.find((f) => f.id === me.id)) all.unshift(me);
  }
  return all;
}

export function getFreelancerById(id: string): FreelancerProfile | null {
  const all = getFreelancers();
  const found = all.find((f) => f.id === id);
  if (found) return found;
  // If belongs to a gig's seller, build minimal
  const gig = getGigs().find((g) => g.sellerId === id);
  if (gig) {
    return { id, name: "Freelancer", occupations: [gig.category], languages: [], skills: gig.skills, rating: 5 };
  }
  return null;
}
