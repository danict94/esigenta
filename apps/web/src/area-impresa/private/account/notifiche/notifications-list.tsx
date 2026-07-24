import type {
  CompanyNotificationListItem,
} from "@esigenta/domain"
import {
  Card,
} from "@esigenta/ui"

import { NotificationCard } from "./notification-card"

type NotificationsListProps = {
  notifications: CompanyNotificationListItem[]
  markReadAction: (formData: FormData) => Promise<void>
}

export function NotificationsList({
  notifications,
  markReadAction,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-sm text-eg-text-muted">
          Non hai ancora notifiche.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          markReadAction={markReadAction}
        />
      ))}
    </div>
  )
}
