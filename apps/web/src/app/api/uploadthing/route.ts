import {
  createRouteHandler,
} from "uploadthing/next"

import {
  requestPhotoFileRouter,
} from "./core"

export const {
  GET,
  POST,
} = createRouteHandler({
  router: requestPhotoFileRouter,
})
