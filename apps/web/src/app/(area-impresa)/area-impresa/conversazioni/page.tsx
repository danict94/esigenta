import {
  redirect,
} from "next/navigation"

export const dynamic = "force-dynamic"

export default function LegacyCompanyConversationsPage() {
  redirect("/area-impresa/contatti")
}
