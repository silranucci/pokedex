import { HttpApiBuilder } from "@effect/platform"
import { Api } from "app/Api"
import * as ApiError from "app/lib/ApiError"
import { Console, Effect, Layer, Match } from "effect"
import * as PokemonService from "./Service.js"

export const HttpPokemonLive = HttpApiBuilder.group(Api, "pokemon", (handlers) =>
  Effect.gen(function*() {
    const pokemon = yield* PokemonService.PokemonService
    return handlers
      .handle("getBy", ({ path }) =>
        pokemon.getBy(path.name).pipe(
          Effect.tapError(Console.error),
          Effect.mapError((e) =>
            Match.value(e._tag).pipe(
              Match.when(
                "PokemonNotFoundError",
                () => new ApiError.NotFoundError({ message: `${path.name} not found` })
              ),
              Match.when(
                "PokemonFetchError",
                () => new ApiError.InternalServerError({ message: "Sorry, something went wrong!" })
              ),
              Match.exhaustive
            )
          )
        ))
  })).pipe(
    Layer.provide([
      PokemonService.PokemonService.Live
    ])
  )
