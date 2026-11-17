import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        rfc7464: resolve(__dirname, "src/rfc7464.ts"),
        jsonlines: resolve(__dirname, "src/jsonlines.ts"),
      },
      formats: ["es"],
    },
  },
});
