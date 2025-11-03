import { HttpApiBuilder } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { ApiLive } from "app/Http"
import { Effect, Fiber, Layer } from "effect"
import { createServer } from "http"

export const spawnApp = async () => {
  const httpServer = createServer()

  const server = HttpApiBuilder.serve().pipe(
    Layer.provide(ApiLive),
    Layer.provide(NodeHttpServer.layer(() => httpServer, { port: 0 }))
  )

  const fiber = Effect.runFork(
    Layer.launch(server)
  )
  const cleanup = () => Effect.runPromise(Fiber.interrupt(fiber))

  // Check if the server is up
  await new Promise<void>((resolve) => {
    const checkListening = () => {
      if (httpServer.listening) {
        resolve()
      } else {
        setTimeout(checkListening, 10)
      }
    }
    checkListening()
  })

  const address = httpServer.address()
  const port = address && typeof address === "object" ? address.port : 0

  return {
    cleanup,
    app: fiber,
    port,
    baseUrl: `http://localhost:${port}`
  }
}
