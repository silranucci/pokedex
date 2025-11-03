import { setupServer } from "msw/node"
import * as PokeApi from "./pokeapi.js"

const handlers = [
  ...PokeApi.handlers
]

export const errorHandlers = {
  pokeApi: PokeApi.errorHandlers
}

export const server = setupServer(...handlers)
