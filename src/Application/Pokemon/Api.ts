import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import * as Pokemon from "app/Domain/Pokemon"
import * as ApiError from "app/lib/ApiError"
import { Schema } from "effect"

export class PokemonApi extends HttpApiGroup.make("pokemon")
  .add(
    HttpApiEndpoint.get("getBy", "/:name")
      .setPath(Schema.Struct({ name: Pokemon.Pokemon.fields.name }))
      .addSuccess(Pokemon.Pokemon)
      .addError(ApiError.NotFoundError, { status: 404 })
      .addError(ApiError.InternalServerError, { status: 500 })
  )
  .prefix("/pokemon")
  .annotate(OpenApi.Title, "Pokemon")
  .annotate(OpenApi.Description, "Manage pokemon")
{}
