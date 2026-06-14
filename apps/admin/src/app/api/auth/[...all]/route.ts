import {
  auth,
} from "@esigenta/auth"

import {
  toNextJsHandler,
} from "better-auth/next-js"

export const {
  GET,
  POST,
} = toNextJsHandler(auth)
