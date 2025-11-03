import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  "InternalServerError",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 500 })
) {}
