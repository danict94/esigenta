import {
  auth,
} from "@fixpro/db"

import {
  toNextJsHandler,
} from "better-auth/next-js"

export const {
  GET,
  POST,
} = toNextJsHandler(auth)
