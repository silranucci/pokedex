import { HttpApi, OpenApi } from "@effect/platform"
import { HealthCheckApi } from "app/Application/HealthCheck/Api"
import { PokemonApi } from "app/Application/Pokemon/Api"

export class Api extends HttpApi.make("api")
  .add(HealthCheckApi)
  .add(PokemonApi)
  .annotate(OpenApi.Title, "Pokedex API")
{}
