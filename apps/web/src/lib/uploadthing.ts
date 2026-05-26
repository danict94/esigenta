import {
  generateReactHelpers,
} from "@uploadthing/react"

import type {
  RequestPhotoFileRouter,
} from "../app/api/uploadthing/core"

export const {
  useUploadThing,
} =
  generateReactHelpers<RequestPhotoFileRouter>()
