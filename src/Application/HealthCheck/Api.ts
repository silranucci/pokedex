import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

export class HealthCheckApi extends HttpApiGroup.make("healthCheck")
  .add(
    HttpApiEndpoint.get("healthcheck", "/health-check")
      .addSuccess(Schema.Struct({
        uptime: Schema.Number,
        status: Schema.Literal("ok"),
        // This could have been a more precise type, but it's just for convenience
        timestamp: Schema.String
      }))
  )
  .annotate(OpenApi.Title, "HealtCheck")
{}
