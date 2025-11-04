import { http, HttpResponse } from "msw"

export const handlers = [
  // FunTranslations API - Shakespeare translation
  http.get("https://api.funtranslations.com/translate/shakespeare.json", async ({ request }) => {
    console.log("I AM CALLED")
    const url = new URL(request.url)
    const text = url.searchParams.get("text")

    return HttpResponse.json({
      success: { total: 1 },
      contents: {
        translated: `Thee ${text} in shakespearean tongue`,
        text,
        translation: "shakespeare"
      }
    })
  }),

  // FunTranslations API - Yoda translation
  http.get("https://api.funtranslations.com/translate/yoda.json", async ({ request }) => {
    const url = new URL(request.url)
    const text = url.searchParams.get("text")

    return HttpResponse.json({
      success: { total: 1 },
      contents: {
        translated: `${text}, hmm, yes`,
        text,
        translation: "yoda"
      }
    })
  })
]

export const errorHandlers = {
  translationApiDown: http.get("https://api.funtranslations.com/translate/*", () => {
    return HttpResponse.json(
      { error: { code: 500, message: "Internal Server Error" } },
      { status: 500 }
    )
  }),

  translationApiRateLimit: http.get("https://api.funtranslations.com/translate/*", () => {
    return HttpResponse.json(
      {
        error: {
          code: 429,
          message: "Too Many Requests: Rate limit of 5 requests per hour exceeded."
        }
      },
      { status: 429 }
    )
  })
}
