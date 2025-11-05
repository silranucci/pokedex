import { FetchHttpClient, HttpClient } from "@effect/platform"
import { PokemonRepository } from "app/Application/Ports/PokemonRepository"
import * as Pokemon from "app/Domain/Pokemon"
import { removeNonPrintableChars } from "app/lib/sanitizer"
import { Effect, Layer, Match, ParseResult, Schema } from "effect"

/**
 * External API Response Schemas
 * ref: https://pokeapi.co/docs/v2
 */
const FlavorText = Schema.Struct({
  flavor_text: Schema.String,
  language: Schema.Struct({
    name: Schema.String,
    url: Schema.String
  })
})

const Habitat = Schema.Struct({
  name: Schema.String
})

const PokemonSpeciesResponse = Schema.Struct({
  name: Schema.NonEmptyString,
  is_legendary: Schema.Boolean,
  flavor_text_entries: Schema.Array(FlavorText),
  habitat: Schema.NullOr(Habitat)
})

/**
 * Transform external API response to domain model
 */
const PokemonFromPokeApiSpeciesResponse = Schema.transformOrFail(
  PokemonSpeciesResponse,
  Pokemon.Pokemon,
  {
    strict: true,
    decode: (response) => {
      const description = response.flavor_text_entries
        .filter((fte) => fte.language.name === "en")
        .at(0)?.flavor_text || ""
      const pokemon = Pokemon.Pokemon.make({
        name: response.name,
        description: removeNonPrintableChars(description),
        habitat: response.habitat?.name || "unknown",
        is_legendary: response.is_legendary
      })
      return ParseResult.succeed(pokemon)
    },
    encode: (pokemon, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          pokemon,
          "Encoding pokemon back to PokeAPI response is forbidden."
        )
      )
  }
)

const PokeApiSpeciesDecoder = Schema.compose(
  PokemonSpeciesResponse,
  PokemonFromPokeApiSpeciesResponse
)

const _parsePokeApiSpeciesResponse = Schema.decodeUnknown(PokeApiSpeciesDecoder)
const parsePokeApiSpeciesResponse = (name: Pokemon.PokemonName) => (raw: unknown) =>
  _parsePokeApiSpeciesResponse(raw).pipe(
    Effect.mapError(
      (e) =>
        Pokemon.PokemonFetchError.make({
          name,
          message: `Failed to parse pokemon data: ${e.message}`
        })
    )
  )

/**
 * Layer that provides PokemonRepository using PokeAPI adapter
 */
export const PokeApi = Layer.effect(
  PokemonRepository,
  Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient

    const findByName = (name: Pokemon.PokemonName) =>
      httpClient.get(
        `https://pokeapi.co/api/v2/pokemon-species/${name}`
      ).pipe(
        Effect.flatMap((res) =>
          Match.value(res.status).pipe(
            Match.when(200, () =>
              res.json.pipe(
                Effect.flatMap(parsePokeApiSpeciesResponse(name))
              )),
            Match.when(404, () => Effect.fail(Pokemon.PokemonNotFoundError.make({ name }))),
            Match.orElse(() =>
              Effect.fail(
                Pokemon.PokemonFetchError.make({
                  name,
                  message: `API returned HTTP ${res.status}`
                })
              )
            )
          )
        ),
        Effect.catchTags({
          RequestError: (error) =>
            Effect.fail(
              Pokemon.PokemonFetchError.make({
                name,
                message: `Request failed: ${error.reason}`
              })
            ),
          ResponseError: (error) =>
            Effect.fail(
              Pokemon.PokemonFetchError.make({
                name,
                message: `Response error: ${error.reason}`
              })
            )
        })
      )

    return { findByName } as const
  })
).pipe(Layer.provide(FetchHttpClient.layer))
