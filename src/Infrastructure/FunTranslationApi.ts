import { FetchHttpClient, HttpClient } from "@effect/platform"
import { TranslationError, TranslationService } from "app/Application/Ports/TranslationService"
import { Effect, Layer, Match, Schema } from "effect"

type FunTranslationApiKind = "shakespeare" | "yoda"

const FunTranslationResponse = Schema.Struct({
  contents: Schema.Struct({
    translated: Schema.NonEmptyString,
    text: Schema.NonEmptyString,
    translation: Schema.String
  })
})

const _parseResponse = Schema.decodeUnknown(FunTranslationResponse)
const parseResponse = (raw: unknown) =>
  _parseResponse(raw).pipe(
    Effect.mapError((e) => TranslationError.make({ cause: e }))
  )

const FunTranslationError = Schema.Struct({
  error: Schema.Struct({
    code: Schema.Number,
    message: Schema.String
  })
})

export const FunTranslationApi = Layer.effect(
  TranslationService,
  Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient

    const makeTranslator =
      (kind: FunTranslationApiKind) => (text: string): Effect.Effect<string, TranslationError, never> =>
        Effect.gen(function*() {
          // Seems that the funapi does not like some unprintable characters
          const encodedText = encodeURIComponent(text.replace(/[\x00-\x1F\x7F]/g, " "))
          // Note that this Api has a rate limit of 10 requests per hour
          const res = yield* httpClient.get(
            `https://api.funtranslations.com/translate/${kind}.json?text=${encodedText}`
          )

          return yield* Match.value(res.status).pipe(
            Match.when(200, () =>
              res.json.pipe(
                Effect.flatMap(parseResponse),
                Effect.map((res) => res.contents.translated)
              )),
            // The RateLimitError is just returned so that it is printed to the console
            // No explicit retry logic is added
            Match.when(429, () =>
              Effect.fail(
                TranslationError.make({ cause: new Error("Rate limit exceeded") })
              )),
            Match.orElse(() =>
              Effect.fail(
                TranslationError.make({
                  cause: FunTranslationError.make({
                    error: {
                      code: res.status,
                      message: res.toString()
                    }
                  })
                })
              )
            )
          )
        }).pipe(
          Effect.catchTags({
            ResponseError: (responseError) => TranslationError.make({ cause: responseError }),
            RequestError: (requestError) => TranslationError.make({ cause: requestError })
          })
        )

    return {
      translateToShakespeare: makeTranslator("shakespeare"),
      translateToYoda: makeTranslator("yoda")
    } as const
  })
).pipe(Layer.provide(FetchHttpClient.layer))
