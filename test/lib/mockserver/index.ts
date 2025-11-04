import { setupServer } from "msw/node"
import * as FunTranslationApi from "./funtranslationapi.js"
import * as PokeApi from "./pokeapi.js"

const handlers = [
  ...PokeApi.handlers,
  ...FunTranslationApi.handlers
]

export const errorHandlers = {
  pokeApi: PokeApi.errorHandlers,
  funTranslationApi: FunTranslationApi.errorHandlers
}

export const server = setupServer(...handlers)
