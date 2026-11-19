import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        rfc7464: resolve(import.meta.dirname, "src/rfc7464.ts"),
        jsonlines: resolve(import.meta.dirname, "src/jsonlines.ts"),
      },
      formats: ["es"],
    },
  },
});
