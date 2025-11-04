import { http, HttpResponse } from "msw"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { errorHandlers as _errorHandlers, server } from "./lib/mockserver/index.js"
import { spawnApp } from "./lib/spawn-app.js"

describe("Pokemon API - getByTranslated", () => {
  const errorHandlers = _errorHandlers
  let cleanup: () => Promise<unknown>
  let baseUrl: string = ""

  beforeAll(async () => {
    const fiber = await spawnApp()
    cleanup = fiber.cleanup
    baseUrl = fiber.baseUrl
  })

  afterAll(async () => {
    await cleanup()
  })

  describe("Success Cases - Shakespeare Translation", () => {
    it("should return pokemon with Shakespeare translation for forest habitat", async () => {
      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "pikachu",
        habitat: "forest",
        is_legendary: false
      })
      // Verify Shakespeare translation was applied
      expect(data.description).toContain("Thee")
      expect(data.description).toContain("shakespearean tongue")
    })

    it("should return pokemon with Shakespeare translation for non-cave, non-legendary pokemon", async () => {
      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.is_legendary).toBe(false)
      expect(data.habitat).not.toBe("cave")
      expect(data.description).toContain("shakespearean tongue")
    })
  })

  describe("Success Cases - Yoda Translation", () => {
    it("should return legendary pokemon with Yoda translation", async () => {
      server.use(errorHandlers.pokeApi.speciesNullHabitat) // mewtwo is legendary

      const response = await fetch(`${baseUrl}/pokemon/translated/mewtwo`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "mewtwo",
        habitat: "unknown",
        is_legendary: true
      })
      // Verify Yoda translation was applied
      expect(data.description).toContain("hmm, yes")
    })

    it("should return cave habitat pokemon with Yoda translation", async () => {
      server.use(
        http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
          return HttpResponse.json({
            name: "zubat",
            id: 41,
            habitat: { name: "cave", url: "https://pokeapi.co/api/v2/pokemon-habitat/1/" },
            is_legendary: false,
            flavor_text_entries: [
              {
                flavor_text: "Forms colonies in perpetually dark places.",
                language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" }
              }
            ]
          })
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/zubat`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.habitat).toBe("cave")
      expect(data.is_legendary).toBe(false)
      // Verify Yoda translation was applied
      expect(data.description).toContain("hmm, yes")
    })
  })

  describe("Empty Description Cases", () => {
    it("should return pokemon without translation when description is empty", async () => {
      server.use(errorHandlers.pokeApi.speciesInvalidLanguage) // Returns empty description

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        name: "pikachu",
        description: "",
        habitat: "forest",
        is_legendary: false
      })
    })
  })

  describe("Not Found Cases", () => {
    it("should return 404 when pokemon does not exist", async () => {
      server.use(errorHandlers.pokeApi.speciesNotFound)

      const response = await fetch(`${baseUrl}/pokemon/translated/nonexistentpokemon12345`)

      expect(response.status).toBe(404)
      const data = await response.json()

      expect(data).toMatchObject({
        _tag: "NotFoundError",
        message: "nonexistentpokemon12345 not found"
      })
    })
  })

  describe("Pokemon API Error Cases", () => {
    it("should return 500 when PokeAPI returns 500", async () => {
      server.use(errorHandlers.pokeApi.species500Error)

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 500 when PokeAPI returns 503", async () => {
      server.use(errorHandlers.pokeApi.species503Error)

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 500 when PokeAPI response has missing required fields", async () => {
      server.use(errorHandlers.pokeApi.speciesMalformed)

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })
  })

  describe("Translation API Error Cases", () => {
    it("should return 500 when translation API is down (500)", async () => {
      server.use(errorHandlers.funTranslationApi.translationApiDown)

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 429 when translation API rate limit exceeded", async () => {
      server.use(errorHandlers.funTranslationApi.translationApiRateLimit)

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "TooManyRequest",
        message: "Retry in 1 hour"
      })
    })

    it("should handle rate limit for Yoda translation (legendary pokemon)", async () => {
      server.use(
        errorHandlers.pokeApi.speciesNullHabitat, // mewtwo is legendary
        errorHandlers.funTranslationApi.translationApiRateLimit
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/mewtwo`)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "TooManyRequest",
        message: "Retry in 1 hour"
      })
    })

    it("should return 500 when translation API returns malformed response", async () => {
      server.use(
        http.get("https://api.funtranslations.com/translate/*", () => {
          return HttpResponse.json({
            // Missing required 'contents' field
            success: { total: 1 }
          })
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })

    it("should return 500 when translation API returns empty translated text", async () => {
      server.use(
        http.get("https://api.funtranslations.com/translate/*", () => {
          return HttpResponse.json({
            contents: {
              translated: "", // Empty string should fail NonEmptyString validation
              text: "some text",
              translation: "shakespeare"
            }
          })
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toMatchObject({
        _tag: "InternalServerError",
        message: "Sorry, something went wrong!"
      })
    })
  })

  describe("Network Error Cases", () => {
    it("should handle PokeAPI network errors gracefully", async () => {
      server.use(
        http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
          return HttpResponse.error()
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.message).toStrictEqual("Sorry, something went wrong!")
    })

    it("should handle Translation API network errors gracefully", async () => {
      server.use(
        http.get("https://api.funtranslations.com/translate/*", () => {
          return HttpResponse.error()
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.message).toStrictEqual("Sorry, something went wrong!")
    })
  })

  describe("Edge Cases", () => {
    it("should handle pokemon with null habitat correctly", async () => {
      server.use(errorHandlers.pokeApi.speciesNullHabitat)

      const response = await fetch(`${baseUrl}/pokemon/translated/mewtwo`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.habitat).toBe("unknown")
      // Mewtwo is legendary, so should use Yoda translation
      expect(data.description).toContain("hmm, yes")
    })

    it("should handle very long descriptions", async () => {
      const longDescription = "A ".repeat(500) + "very long description"
      server.use(
        http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
          return HttpResponse.json({
            name: "pikachu",
            id: 25,
            habitat: { name: "forest", url: "https://pokeapi.co/api/v2/pokemon-habitat/2/" },
            is_legendary: false,
            flavor_text_entries: [
              {
                flavor_text: longDescription,
                language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" }
              }
            ]
          })
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.description).toBeTruthy()
      expect(data.description).toContain("shakespearean tongue")
    })

    it("should handle descriptions with special characters", async () => {
      const specialDescription = "Pikachu's power! It's over 9000 & amazing!"
      server.use(
        http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
          return HttpResponse.json({
            name: "pikachu",
            id: 25,
            habitat: { name: "forest", url: "https://pokeapi.co/api/v2/pokemon-habitat/2/" },
            is_legendary: false,
            flavor_text_entries: [
              {
                flavor_text: specialDescription,
                language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" }
              }
            ]
          })
        })
      )

      const response = await fetch(`${baseUrl}/pokemon/translated/pikachu`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.description).toBeTruthy()
    })
  })
})
