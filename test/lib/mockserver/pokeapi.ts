import { http, HttpResponse } from "msw"

export const handlers = [
  // PokeAPI - Get Pokemon
  http.get("https://pokeapi.co/api/v2/pokemon/:name", ({ params }) => {
    const { name } = params

    // Simulate pokemon not found
    if (name === "nonexistentpokemon12345" || name === "invalidpokemon999") {
      return HttpResponse.json(
        { error: "Not Found" },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      name,
      id: 25,
      species: {
        name,
        url: `https://pokeapi.co/api/v2/pokemon-species/25/`
      },
      types: [
        {
          slot: 1,
          type: { name: "electric", url: "https://pokeapi.co/api/v2/type/13/" }
        }
      ]
    })
  }),

  // PokeAPI - Get Pokemon Species (for description)
  http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json({
      name: "pikachu",
      id: 25,
      habitat: {
        name: "forest",
        url: "https://pokeapi.co/api/v2/pokemon-habitat/2/"
      },
      is_legendary: false,
      flavor_text_entries: [
        {
          flavor_text:
            "When several of these Pokémon gather, their electricity could build and cause lightning storms.",
          language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" },
          version: { name: "red", url: "https://pokeapi.co/api/v2/version/1/" }
        },
        {
          flavor_text:
            "It keeps its tail raised to monitor its surroundings. If you yank its tail, it will try to bite you.",
          language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" },
          version: { name: "blue", url: "https://pokeapi.co/api/v2/version/2/" }
        }
      ]
    })
  })
]

export const errorHandlers = {
  speciesNotFound: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json(
      { error: "Not Found" },
      { status: 404 }
    )
  }),

  speciesMalformed: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json({
      name: "pikachu",
      // Missing required fields to test schema validation
      flavor_text_entries: []
    })
  }),

  speciesInvalidLanguage: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json({
      name: "pikachu",
      id: 25,
      habitat: { name: "forest", url: "https://pokeapi.co/api/v2/pokemon-habitat/2/" },
      is_legendary: false,
      flavor_text_entries: [
        {
          flavor_text: "Japanese description",
          language: { name: "ja", url: "https://pokeapi.co/api/v2/language/1/" }
        }
      ]
    })
  }),

  speciesNullHabitat: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json({
      name: "mewtwo",
      id: 150,
      habitat: null, // Test null habitat handling
      is_legendary: true,
      flavor_text_entries: [
        {
          flavor_text: "A legendary Pokemon.",
          language: { name: "en", url: "https://pokeapi.co/api/v2/language/9/" }
        }
      ]
    })
  }),

  speciesEmptyName: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json({
      name: "", // Test NonEmptyString validation
      id: 25,
      habitat: { name: "forest", url: "https://pokeapi.co/api/v2/pokemon-habitat/2/" },
      is_legendary: false,
      flavor_text_entries: []
    })
  }),

  species500Error: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }),

  species503Error: http.get("https://pokeapi.co/api/v2/pokemon-species/:id", () => {
    return HttpResponse.json(
      { error: "Service Unavailable" },
      { status: 503 }
    )
  })
}
