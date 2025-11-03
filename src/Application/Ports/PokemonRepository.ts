import type * as Pokemon from "app/Domain/Pokemon"
import type { Effect } from "effect"
import { Context } from "effect"

/**
 * Repository interface for Pokemon data access
 * This defines the contract that infrastructure adapters must implement
 */
export interface IPokemonRepository {
  /**
   * Find a pokemon by name
   */
  readonly findByName: (
    name: Pokemon.PokemonName
  ) => Effect.Effect<Pokemon.Pokemon, Pokemon.PokemonFetchError | Pokemon.PokemonNotFoundError>
}

/**
 * Service for dependency injection
 */
export class PokemonRepository extends Context.Tag("PokemonRepository")<
  PokemonRepository,
  IPokemonRepository
>() {}
