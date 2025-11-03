import * as PokemonRespository from "app/Application/Ports/PokemonRepository"
import type * as Pokemon from "app/Domain/Pokemon"
import { PokeApi } from "app/Infrastructure/PokeApi"
import { Context, Effect, Layer } from "effect"

interface IPokemonService {
  readonly getBy: (name: Pokemon.PokemonName) => Effect.Effect<
    Pokemon.Pokemon,
    | Pokemon.PokemonNotFoundError
    | Pokemon.PokemonFetchError,
    never
  >
}

const _PokemonSevice = Effect.gen(function*() {
  const pokemonRepo = yield* PokemonRespository.PokemonRepository

  const getBy = (name: Pokemon.PokemonName) => pokemonRepo.findByName(name)

  return { getBy } as const
})

export class PokemonService extends Context.Tag("Pokemon")<PokemonService, IPokemonService>() {
  static Live = Layer.effect(
    PokemonService,
    _PokemonSevice
  ).pipe(
    Layer.provide(Layer.mergeAll(
      PokeApi
    ))
  )
}
