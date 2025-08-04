import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/app",
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Only initialize in development - Webflow Cloud handles this in production
if (process.env.NODE_ENV === 'development') {
  try {
    initOpenNextCloudflareForDev();
  } catch (error) {
    console.warn('[next.config] Failed to initialize OpenNext Cloudflare for dev:', error);
  }
}
