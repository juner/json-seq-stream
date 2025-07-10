import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["cobertura", "text"],
      reportsDirectory: "./TestResults/coverage",
      exclude: [
        ...coverageConfigDefaults.exclude,
      ]
    }
  }
});