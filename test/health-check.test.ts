import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { spawnApp } from "./util/spawn-app.js"

describe("HealthCheck API", () => {
  let cleanup: () => Promise<unknown>

  beforeAll(async () => {
    const fiber = await spawnApp()
    cleanup = fiber.cleanup;
  })

  afterAll(async () => {
    await cleanup()
  })

  it("should return valid health check", async () => {
    const response = await fetch("http://localhost:5025/health-check")
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe("ok")
    expect(typeof data.uptime).toBe("number")
    expect(data.timestamp).toBeTruthy()
  })
})
