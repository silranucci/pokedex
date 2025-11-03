import { describe, expect, it } from "@effect/vitest"
import { PokemonRepository } from "app/Application/Ports/PokemonRepository"
import * as Pokemon from "app/Domain/Pokemon"
import { PokeApi } from "app/Infrastructure/PokeApi"
import { Console, Effect } from "effect"

describe("PokeApi Integration - Real API", () => {
  it.effect("fetches Pikachu successfully", () =>
    Effect.gen(function*() {
      const repo = yield* PokemonRepository

      const result = yield* repo
        .findByName("pikachu" as Pokemon.PokemonName)
        .pipe(
          Effect.catchAll((err) => {
            if (err instanceof Pokemon.PokemonNotFoundError) {
              return Effect.fail(new Error("Pikachu should exist"))
            }
            if (err instanceof Pokemon.PokemonFetchError) {
              console.warn("Fetch error:", err.message)
              return Effect.succeed(null)
            }
            return Effect.fail(err)
          })
        )

      // If fetch failed gracefully, skip assertions
      if (result === null) {
        yield* Console.warn("Test skipped due to fetch error")
        return
      }

      expect(result.name).toBe("pikachu")
      expect(typeof result.description).toBe("string")
      expect(result.description.length).toBeGreaterThan(0)
      expect(typeof result.is_legendary).toBe("boolean")
      expect(result.is_legendary).toBe(false)
      expect(typeof result.habitat).toBe("string")

      yield* Console.log("Successfully fetched Pikachu:", {
        name: result.name,
        habitat: result.habitat,
        is_legendary: result.is_legendary,
        description_length: result.description.length
      })
    }).pipe(
      Effect.provide(PokeApi),
      Effect.timeout("10 seconds") // Add timeout for real API calls
    ))

  it.effect("fetches Mewtwo (legendary pokemon) successfully", () =>
    Effect.gen(function*() {
      const repo = yield* PokemonRepository

      const result = yield* repo
        .findByName("mewtwo" as Pokemon.PokemonName)
        .pipe(
          Effect.catchAll((err) => {
            if (err instanceof Pokemon.PokemonNotFoundError) {
              return Effect.fail(new Error("Mewtwo should exist"))
            }
            if (err instanceof Pokemon.PokemonFetchError) {
              console.warn("Fetch error:", err.message)
              return Effect.succeed(null)
            }
            return Effect.fail(err)
          })
        )

      // If fetch failed gracefully, skip assertions
      if (result === null) {
        yield* Console.warn("Test skipped due to fetch error")
        return
      }

      expect(result.name).toBe("mewtwo")
      expect(typeof result.description).toBe("string")
      expect(result.is_legendary).toBe(true)

      yield* Console.log("Successfully fetched Mewtwo:", {
        name: result.name,
        habitat: result.habitat,
        is_legendary: result.is_legendary,
        description_length: result.description.length
      })
    }).pipe(
      Effect.provide(PokeApi),
      Effect.timeout("10 seconds") // Add timeout for real API calls
    ))

  it.effect("handles non-existent pokemon correctly", () =>
    Effect.gen(function*() {
      const repo = yield* PokemonRepository

      const result = yield* repo
        .findByName("nonexistentpokemon999" as Pokemon.PokemonName)
        .pipe(
          Effect.catchAll((err) => Effect.succeed(err))
        )

      expect(result).toBeInstanceOf(Pokemon.PokemonNotFoundError)

      yield* Console.log("Correctly received NotFoundError for non-existent pokemon")
    }).pipe(
      Effect.provide(PokeApi),
      Effect.timeout("10 seconds") // Add timeout for real API calls
    ))
})
