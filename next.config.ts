import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily removing basePath to fix API issues
  // basePath: "/app",
};

export default nextConfig;
// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
