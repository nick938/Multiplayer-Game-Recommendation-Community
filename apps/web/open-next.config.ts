import { defineCloudflareConfig } from "@opennextjs/cloudflare"

export default defineCloudflareConfig({
  // MVP: no incremental cache binding (ISR unused — data pages are dynamic).
})
