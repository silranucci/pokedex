import { HttpApiBuilder } from "@effect/platform"
import { Api } from "app/Api"
import { Effect } from "effect"

export const HealthCheckLive = HttpApiBuilder.group(Api, "healthCheck", (handlers) =>
  // eslint-disable-next-line require-yield
  Effect.gen(function*() {
    return handlers.handle("healthcheck", () =>
      Effect.succeed({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }))
  }))
