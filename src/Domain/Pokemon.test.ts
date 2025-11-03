import { fc } from "@fast-check/vitest"
import { Arbitrary, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { Pokemon } from "./Pokemon.js"

// The purpose of this tests is to be a last resort barrier against involuntary regression
describe("Pokemon", () => {
  describe("schema validation", () => {
    it("should create a valid Pokemon instance", () => {
      const pokemon = new Pokemon({
        name: "pikachu",
        description: "An electric mouse pokemon",
        habitat: "forest",
        is_legendary: false
      })

      expect(pokemon.name).toBe("pikachu")
      expect(pokemon.description).toBe("An electric mouse pokemon")
      expect(pokemon.habitat).toBe("forest")
      expect(pokemon.is_legendary).toBe(false)
    })

    it("should accept null habitat", () => {
      const pokemon = new Pokemon({
        name: "pikachu",
        description: "An electric mouse pokemon",
        habitat: null,
        is_legendary: false
      })

      expect(pokemon.habitat).toBeNull()
    })

    it("should reject empty name", () => {
      expect(
        () =>
          new Pokemon({
            name: "",
            description: "An electric mouse pokemon",
            habitat: "forest",
            is_legendary: false
          })
      ).toThrow()
    })

    it("should reject empty habitat string (must be null or non-empty)", () => {
      expect(
        () =>
          new Pokemon({
            name: "pikachu",
            description: "An electric mouse pokemon",
            habitat: "",
            is_legendary: false
          })
      ).toThrow()
    })
  })

  describe("shouldUseYodaTranslation", () => {
    it("should return true for legendary pokemon", () => {
      const pokemon = new Pokemon({
        name: "mewtwo",
        description: "A legendary psychic pokemon",
        habitat: "rare",
        is_legendary: true
      })

      expect(pokemon.shouldUseYodaTranslation()).toBe(true)
    })

    it("should return true for cave habitat pokemon", () => {
      const pokemon = new Pokemon({
        name: "zubat",
        description: "A bat pokemon",
        habitat: "cave",
        is_legendary: false
      })

      expect(pokemon.shouldUseYodaTranslation()).toBe(true)
    })

    it("should return false for non-legendary, non-cave pokemon", () => {
      const pokemon = new Pokemon({
        name: "pikachu",
        description: "An electric mouse pokemon",
        habitat: "forest",
        is_legendary: false
      })

      expect(pokemon.shouldUseYodaTranslation()).toBe(false)
    })

    it("should return false for non-legendary pokemon with null habitat", () => {
      const pokemon = new Pokemon({
        name: "pikachu",
        description: "An electric mouse pokemon",
        habitat: null,
        is_legendary: false
      })

      expect(pokemon.shouldUseYodaTranslation()).toBe(false)
    })
  })
})

describe("Pokemon - Property Based Tests", () => {
  it("symmetry", () => {
    fc.assert(
      fc.property(Arbitrary.make(Pokemon), (pokemon) => {
        expect(pokemon).toEqual(
          Schema.decodeSync(Pokemon)(Schema.encodeSync(Pokemon)(pokemon))
        )
      })
    )
  })
})
