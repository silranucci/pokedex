import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { HealthCheckLive } from "app/Application/HealthCheck/Http"
import { Layer } from "effect"
import { createServer } from "http"
import { Api } from "./Api.js"

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HealthCheckLive
])

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)
