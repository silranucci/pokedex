import * as Path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    alias: {
      app: Path.join(__dirname, "src")
    },
    fileParallelism: false,
    include: ['**/*.smoke.test.{js,ts,jsx,tsx}'],
  }
})
