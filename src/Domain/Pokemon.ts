import { Schema } from "effect"

export type PokemonName = typeof PokemonName.Type
export const PokemonName = Schema.NonEmptyString

export class Pokemon extends Schema.Class<Pokemon>("Pokemon")({
  name: PokemonName,
  description: Schema.String,
  habitat: Schema.NullOr(Schema.NonEmptyString),
  is_legendary: Schema.Boolean
}) {
  /**
   * Determine if pokemon should use Yoda translation
   * Legendary pokemon or cave dwellers speak like Yoda
   */
  shouldUseYodaTranslation(): boolean {
    return this.habitat === "cave" || this.is_legendary
  }
}

export class PokemonNotFoundError extends Schema.TaggedError<PokemonNotFoundError>()(
  "PokemonNotFoundError",
  {
    name: Pokemon.fields.name
  }
) {}

export class PokemonFetchError extends Schema.TaggedError<PokemonFetchError>()(
  "PokemonFetchError",
  {
    name: Pokemon.fields.name,
    message: Schema.String
  }
) {}
