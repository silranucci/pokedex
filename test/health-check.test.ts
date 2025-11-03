import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { spawnApp } from "./lib/spawn-app.js"

describe("HealthCheck API", () => {
  let cleanup: () => Promise<unknown>
  let baseUrl: string = ""

  beforeAll(async () => {
    const fiber = await spawnApp()
    cleanup = fiber.cleanup
    baseUrl = fiber.baseUrl
  })

  afterAll(async () => {
    await cleanup()
  })

  it("should return valid health check", async () => {
    const response = await fetch(`${baseUrl}/health-check`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe("ok")
    expect(typeof data.uptime).toBe("number")
    expect(data.timestamp).toBeTruthy()
  })
})
