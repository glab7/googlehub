import type { NextConfig } from "next";

// Static export: `npm run build` writes the site to out/, which Cloudflare
// Pages and the Go server both serve.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
