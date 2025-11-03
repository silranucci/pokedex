import { http, HttpResponse } from "msw"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { errorHandlers as _errorHandlers, server } from "./lib/mockserver/index.js"
import { spawnApp } from "./lib/spawn-app.js"

describe("Pokemon API - getBy", () => {
  const errorHandlers = _errorHandlers.pokeApi
  let cleanup: () => Promise<unknown>
  let baseUrl: string = ""

  beforeAll(async () => {
    const fiber = await spawnApp()
    cleanup = fiber.cleanup
    baseUrl = fiber.baseUrl
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(async () => {
    await cleanup()
  })

  describe("Success Cases", () => {
    it("should return valid pokemon with all fields", async () => {
      const response = await fetch(`${baseUrl}/pokemon/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "pikachu",
        description: "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
        habitat: "forest",
        is_legendary: false
      })
    })

    it("should return pokemon with null habitat as 'unknown'", async () => {
      server.use(errorHandlers.speciesNullHabitat)

      const response = await fetch(`${baseUrl}/pokemon/mewtwo`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "mewtwo",
        description: "A legendary Pokemon.",
        habitat: "unknown",
        is_legendary: true
      })
    })

    it("should return pokemon with empty description when no English flavor text", async () => {
      server.use(errorHandlers.speciesInvalidLanguage)

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "pikachu",
        description: "",
        habitat: "forest",
        is_legendary: false
      })
    })

    it("should return legendary pokemon correctly", async () => {
      server.use(errorHandlers.speciesNullHabitat)

      const response = await fetch(`${baseUrl}/pokemon/mewtwo`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.is_legendary).toBe(true)
    })
  })

  describe("Not Found Cases", () => {
    it("should return 404 when pokemon does not exist", async () => {
      server.use(errorHandlers.speciesNotFound)

      const response = await fetch(`${baseUrl}/pokemon/nonexistentpokemon12345`)

      expect(response.status).toBe(404)
      const data = await response.json()

      expect(data).toMatchObject({
        _tag: "NotFoundError",
        message: "nonexistentpokemon12345 not found"
      })
    })
  })

  describe("HTTP Error Cases", () => {
    it("should return 500 when PokeAPI returns 500", async () => {
      server.use(errorHandlers.species500Error)

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 500 when PokeAPI returns 503", async () => {
      server.use(errorHandlers.species503Error)

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })
  })

  describe("Schema Validation Errors", () => {
    it("should return 500 when PokeAPI response has missing required fields", async () => {
      server.use(errorHandlers.speciesMalformed)

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 500 when pokemon name is empty (schema validation)", async () => {
      server.use(errorHandlers.speciesEmptyName)

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.message).toStrictEqual("Sorry, something went wrong!")
    })
  })

  describe("Network Error Cases", () => {
    it("should handle network errors gracefully", async () => {
      server.use(
        http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
          return HttpResponse.error()
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.message).toStrictEqual("Sorry, something went wrong!")
    })
  })
})
