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
 * Translation service interface
 */
export interface ITranslationService {
  /**
   * Translate text to Shakespeare style
   */
  readonly translateToShakespeare: (
    text: string
  ) => Effect.Effect<string, TranslationError, never>

  /**
   * Translate text to Yoda style
   */
  readonly translateToYoda: (
    text: string
  ) => Effect.Effect<string, TranslationError, never>
}

/**
 * Service for dependency injection
 */
export class TranslationService extends Context.Tag("TranslationService")<
  TranslationService,
  ITranslationService
>() {}
