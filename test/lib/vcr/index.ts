import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { Effect } from "effect"
import nock from "nock"
import * as path from "node:path"

const CASSETTE_DIR = path.resolve(__dirname, "cassettes")

interface CassetteEntry {
  scope: string
  method: string
  path: string
  status: number
  response: unknown
  headers: Record<string, string>
}

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options"

const replayEntry = (entry: CassetteEntry, expectedStatus: number): void => {
  // Throw error if response doesn't match expected status
  if (entry.status !== expectedStatus) {
    throw new Error(
      `VCR: Recorded response for ${entry.method.toUpperCase()} ${entry.scope}${entry.path} ` +
        `returned status ${entry.status}. Expected ${expectedStatus}.`
    )
  }

  const scope = nock(entry.scope)
  const method = entry.method.toLowerCase() as HttpMethod
  const response = entry.response as nock.Body
  const headers = entry.headers as nock.ReplyHeaders

  switch (method) {
    case "get":
      scope.get(entry.path).reply(entry.status, response, headers)
      break
    case "post":
      scope.post(entry.path).reply(entry.status, response, headers)
      break
    case "put":
      scope.put(entry.path).reply(entry.status, response, headers)
      break
    case "patch":
      scope.patch(entry.path).reply(entry.status, response, headers)
      break
    case "delete":
      scope.delete(entry.path).reply(entry.status, response, headers)
      break
    case "head":
      scope.head(entry.path).reply(entry.status, response, headers)
      break
    case "options":
      scope.options(entry.path).reply(entry.status, response, headers)
      break
    default:
      // Fallback for any other methods
      ;(scope as any)[method](entry.path).reply(entry.status, response, headers)
  }
}

export const useCassette = <A, E, R>(
  name: string,
  effect: Effect.Effect<A, E, R>,
  expectedStatus: number = 200
) =>
  Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const filePath = path.join(CASSETTE_DIR, `${name}.json`)
    const exists = yield* fs.exists(filePath)

    if (exists) {
      // Playback mode
      const recordedStr = yield* fs.readFileString(filePath)
      const recorded: Array<CassetteEntry> = JSON.parse(recordedStr)

      recorded.forEach((entry) => replayEntry(entry, expectedStatus))

      return yield* effect
    } else {
      // Record mode
      nock.recorder.clear()
      nock.recorder.rec({
        dont_print: true,
        output_objects: true
      })

      const result = yield* effect

      const recorded = nock.recorder.play() as Array<CassetteEntry>

      // Check for non-expected status responses in recorded data
      for (const entry of recorded) {
        if (entry.status !== expectedStatus) {
          nock.recorder.clear()
          throw new Error(
            `VCR: Recorded response for ${entry.method.toUpperCase()} ${entry.scope}${entry.path} ` +
              `returned status ${entry.status}. Expected ${expectedStatus}. Recording aborted.`
          )
        }
      }

      yield* fs.makeDirectory(CASSETTE_DIR, { recursive: true })
      yield* fs.writeFileString(
        filePath,
        JSON.stringify(recorded, null, 2)
      )
      nock.recorder.clear()

      return result
    }
  }).pipe(
    Effect.provide(NodeFileSystem.layer)
  )
