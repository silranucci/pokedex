import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { HealthCheckLive } from "app/Application/HealthCheck/Http"
import { HttpPokemonLive } from "app/Application/Pokemon/Http"
import { Layer } from "effect"
import { createServer } from "http"
import { Api } from "./Api.js"

export const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HealthCheckLive,
  HttpPokemonLive
])

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { host: "0.0.0.0", port: 3000 }))
)
