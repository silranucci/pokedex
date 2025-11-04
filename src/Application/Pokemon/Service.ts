import * as PokemonRespository from "app/Application/Ports/PokemonRepository"
import type { TranslationError, TranslationRateLimitExceededError } from "app/Application/Ports/TranslationService"
import { TranslationService } from "app/Application/Ports/TranslationService"
import * as Pokemon from "app/Domain/Pokemon"
import { FunTranslationApi } from "app/Infrastructure/FunTranslationApi"
import { PokeApi } from "app/Infrastructure/PokeApi"
import { Context, Effect, Layer } from "effect"

interface IPokemonService {
  readonly getBy: (name: Pokemon.PokemonName) => Effect.Effect<
    Pokemon.Pokemon,
    | Pokemon.PokemonNotFoundError
    | Pokemon.PokemonFetchError,
    never
  >
  readonly getByTranslated: (name: Pokemon.PokemonName) => Effect.Effect<
    Pokemon.Pokemon,
    | Pokemon.PokemonNotFoundError
    | Pokemon.PokemonFetchError
    | TranslationError
    | TranslationRateLimitExceededError,
    never
  >
}

const _PokemonSevice = Effect.gen(function*() {
  const pokemonRepo = yield* PokemonRespository.PokemonRepository
  const translationService = yield* TranslationService

  const getBy = (name: Pokemon.PokemonName) => pokemonRepo.findByName(name)

  const getByTranslated = (name: Pokemon.PokemonName) =>
    Effect.gen(function*() {
      const pokemon = yield* pokemonRepo.findByName(name)
      // If the description is empty the getByTranslated
      // degenerates to a getBy
      if (pokemon.description === "") {
        return pokemon
      }

      const translate = pokemon.shouldUseYodaTranslation()
        ? translationService.translateToYoda
        : translationService.translateToShakespeare
      const translatedDescription = yield* translate(pokemon.description)

      return Pokemon.Pokemon.make({
        ...pokemon,
        description: translatedDescription
      })
    })

  return { getBy, getByTranslated } as const
})

export class PokemonService extends Context.Tag("Pokemon")<PokemonService, IPokemonService>() {
  static Live = Layer.effect(
    PokemonService,
    _PokemonSevice
  ).pipe(
    Layer.provide(Layer.mergeAll(
      PokeApi,
      FunTranslationApi
    ))
  )
}
