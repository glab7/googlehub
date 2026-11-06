import data from "../../public/data/catalog.json";

export type App = {
  id: string;
  name: string;
  category: string;
  color: string;
  tagline: string;
};

export type Plan = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  highlight: boolean;
};

export type Catalog = { categories: string[]; apps: App[]; plans: Plan[] };

// The same file is served at /data/catalog.json and read by the Go server and
// the Cloudflare Pages Function, so the site, API and mobile app stay in sync.
export const catalog = data as Catalog;
