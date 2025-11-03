import { HttpApiBuilder } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Api } from "app/Api";
import { HealthCheckLive } from "app/Application/HealthCheck/Http";
import { Effect, Fiber, Layer } from "effect";
import { createServer } from "http";

export const spawnApp = async () => {
  const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
    HealthCheckLive
  ])

  const server = HttpApiBuilder.serve().pipe(
    Layer.provide(ApiLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 5025 })),
  )

  const fiber = Effect.runFork(
    Layer.launch(server)
  )
  const cleanup = () => Effect.runPromise(Fiber.interrupt(fiber));

  return {
    cleanup,
    app: fiber
  }

}
