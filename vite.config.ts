import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cloud previews reach the dev server through a per-VM hostname. It is supplied
// at run time rather than written into this file, so no hostname is tracked.
const runtime = globalThis as unknown as {
  process?: { env?: Record<string, string | undefined> };
};
const previewHosts = (
  runtime.process?.env?.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? ""
)
  .split(",")
  .map((host: string) => host.trim())
  .filter((host: string) => Boolean(host));

export default defineConfig({
  // Relative asset URLs so the build also works from a GitHub Pages project
  // site (https://user.github.io/repo-name/) and not just a domain root.
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: previewHosts,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
