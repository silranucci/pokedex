import type { Effect } from "effect"
import { Context, Schema } from "effect"

/**
 * Translation error from external service
 */
export class TranslationError extends Schema.TaggedError<TranslationError>()(
  "TranslationError",
  {
    cause: Schema.Unknown
  }
) {}

/**
 * Translation rate limit exceeded from external service
 */
export class TranslationRateLimitExceededError extends Schema.TaggedError<TranslationRateLimitExceededError>()(
  "TranslationRateLimitExceededError",
  {
    // This should have been the number of milliseconds
    // For convenience we just return the message as returned by the FunTranslationApi
    retryIn: Schema.String
  }
) {}

/**
 * Translation service interface
 */
export interface ITranslationService {
  /**
   * Translate text to Shakespeare style
   */
  readonly translateToShakespeare: (
    text: string
  ) => Effect.Effect<string, TranslationError | TranslationRateLimitExceededError, never>

  /**
   * Translate text to Yoda style
   */
  readonly translateToYoda: (
    text: string
  ) => Effect.Effect<string, TranslationError | TranslationRateLimitExceededError, never>
}

/**
 * Service for dependency injection
 */
export class TranslationService extends Context.Tag("TranslationService")<
  TranslationService,
  ITranslationService
>() {}
