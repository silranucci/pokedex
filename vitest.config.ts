import * as Path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/lib/setup.ts'],
    environment: "node",
    alias: {
      app: Path.join(__dirname, "src")
    },
    fileParallelism: false,
    include: ['**/*.test.{js,ts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.smoke.test.{js,ts,jsx,tsx}'
    ],
  }
})
