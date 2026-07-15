import {
  createRequestPhotoDisplayItems,
  type RequestPhotoDisplayItem,
} from "@esigenta/uploads/server"

import type { FullRequestDetail } from "@esigenta/domain"

// Only import target for @esigenta/uploads/server in this flow — loaded dynamically, and only when photoCount > 0, so UTApi is never constructed for photo-less requests.
export async function loadFullRequestPhotos(
  photos: FullRequestDetail["photos"],
): Promise<RequestPhotoDisplayItem[]> {
  return createRequestPhotoDisplayItems(photos)
}
