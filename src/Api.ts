import { HttpApi, OpenApi } from "@effect/platform"
import { HealthCheckApi } from "app/Application/HealthCheck/Api"

export class Api extends HttpApi.make("api")
  .add(HealthCheckApi)
  .annotate(OpenApi.Title, "Pokedex API")
{}
