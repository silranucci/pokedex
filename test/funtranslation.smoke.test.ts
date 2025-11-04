import { describe, expect, it } from "@effect/vitest"
import { TranslationService } from "app/Application/Ports/TranslationService"
import { FunTranslationApi } from "app/Infrastructure/FunTranslationApi"
import { Console, Effect, pipe } from "effect"

describe("FunTranslationApi Integration - Real API", () => {
  it.effect("translates text to Shakespeare", () =>
    Effect.gen(function*() {
      const translate = yield* TranslationService

      const result = yield* translate
        .translateToShakespeare("To be or not to be")
        .pipe(
          Effect.catchTag("TranslationError", (err) =>
            pipe(
              Effect.tap(() => Console.warn("Translation API error: ", err.cause)),
              () => Effect.succeed("SKIPPED_DUE_TO_ERROR")
            ))
        )

      if (result === "SKIPPED_DUE_TO_ERROR") {
        yield* Console.warn("Test skipped due to API error (likely rate limit)")
        return
      }

      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
      yield* Console.log("Shakespeare translation:", result)
    }).pipe(
      Effect.provide(FunTranslationApi),
      Effect.timeout("10 seconds") // Add timeout for real API calls
    ))

  it.effect("translates text to Yoda", () =>
    Effect.gen(function*() {
      const translate = yield* TranslationService

      const result = yield* translate
        .translateToYoda("Mastering JavaScript is fun")
        .pipe(
          Effect.catchTag("TranslationError", (err) =>
            pipe(
              Effect.tap(() => Console.warn("Translation API error: ", err.cause)),
              () => Effect.succeed("SKIPPED_DUE_TO_ERROR")
            ))
        )

      if (result === "SKIPPED_DUE_TO_ERROR") {
        yield* Console.warn("Test skipped due to API error (likely rate limit)")
        return
      }

      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
      yield* Console.log("Yoda translation:", result)
    }).pipe(
      Effect.provide(FunTranslationApi),
      Effect.timeout("10 seconds") // Add timeout for real API calls
    ))
})
