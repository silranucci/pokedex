import { FetchHttpClient, HttpClient } from "@effect/platform"
import {
  TranslationError,
  TranslationRateLimitExceededError,
  TranslationService
} from "app/Application/Ports/TranslationService"
import { Data, Effect, Layer, Match, Schema } from "effect"

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
    Effect.mapError((e) => new TranslationError({ cause: e }))
  )

const FunTranslationErrorResponse = Schema.Struct({
  error: Schema.Struct({
    code: Schema.Number, // This should have been a more appropriate type
    message: Schema.String
  })
})

const _parseErrorResponse = Schema.decodeUnknown(FunTranslationErrorResponse)
const parseErrorResponse = (res: unknown) =>
  _parseErrorResponse(res).pipe(
    Effect.mapError((e) => new TranslationError({ cause: e }))
  )

class FunTranslationError extends Data.TaggedError("FunTranslationError")<{
  code: number
  message: string
}> {
  static readonly make = ({ code, message }: { code: number; message: string }) => new this({ code, message })
}

export const FunTranslationApi = Layer.effect(
  TranslationService,
  Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient

    const makeTranslator =
      (kind: FunTranslationApiKind) =>
      (text: string): Effect.Effect<string, TranslationError | TranslationRateLimitExceededError, never> =>
        Effect.gen(function*() {
          // Seems that the funapi does not like some unprintable characters
          // eslint-disable-next-line no-control-regex
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
            Match.when(429, () =>
              Effect.gen(function*() {
                const json = yield* res.json
                const jsonError = yield* parseErrorResponse(json)
                const retryIn = jsonError.error.message.split(".")[1]!.trim()
                return yield* Effect.fail(new TranslationRateLimitExceededError({ retryIn }))
              })),
            Match.orElse(() =>
              Effect.gen(function*() {
                const json = yield* res.json
                const jsonError = yield* parseErrorResponse(json)
                return yield* Effect.fail(
                  new TranslationError({
                    cause: FunTranslationError.make({
                      code: res.status,
                      message: jsonError.error.message
                    })
                  })
                )
              })
            )
          )
        }).pipe(
          Effect.catchTags({
            ResponseError: (responseError) => new TranslationError({ cause: responseError }),
            RequestError: (requestError) => new TranslationError({ cause: requestError })
          })
        )

    return {
      translateToShakespeare: makeTranslator("shakespeare"),
      translateToYoda: makeTranslator("yoda")
    } as const
  })
).pipe(Layer.provide(FetchHttpClient.layer))
