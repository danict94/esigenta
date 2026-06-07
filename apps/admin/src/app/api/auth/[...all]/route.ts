import {
  auth,
} from "@esigenta/db/auth"

import {
  toNextJsHandler,
} from "better-auth/next-js"

export const {
  GET,
  POST,
} = toNextJsHandler(auth)
