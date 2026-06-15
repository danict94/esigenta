"use client"

import type {
  MouseEvent,
  ReactNode,
} from "react"
import {
  useTransition,
} from "react"
import {
  useFormStatus,
} from "react-dom"
import Link from "next/link"
import {
  useRouter,
} from "next/navigation"

import {
  Button,
  cn,
  type ButtonProps,
} from "@esigenta/ui"

type PendingSubmitButtonProps = Omit<
  ButtonProps,
  "children"
> & {
  children: ReactNode
  pendingChildren?: ReactNode
}

export function PendingSubmitButton({
  children,
  pendingChildren,
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const {
    pending,
  } = useFormStatus()
  const isDisabled =
    pending || disabled

  return (
    <Button
      {...props}
      disabled={isDisabled}
      aria-busy={pending}
    >
      {pending && pendingChildren
        ? pendingChildren
        : children}
    </Button>
  )
}

type PendingRequestLinkProps = {
  href: string
  children: ReactNode
  pendingChildren?: ReactNode
  className?: string
  ariaLabel?: string
  prefetch?: boolean
}

function shouldUseBrowserNavigation(
  event: MouseEvent<HTMLAnchorElement>,
) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    (event.currentTarget.target &&
      event.currentTarget.target !== "_self")
  )
}

export function PendingRequestLink({
  href,
  children,
  pendingChildren,
  className,
  ariaLabel,
  prefetch,
}: PendingRequestLinkProps) {
  const router = useRouter()
  const [
    isPending,
    startTransition,
  ] = useTransition()

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    if (isPending) {
      event.preventDefault()
      return
    }

    if (shouldUseBrowserNavigation(event)) {
      return
    }

    event.preventDefault()

    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <Link
      href={href}
      prefetch={prefetch ?? false}
      aria-label={ariaLabel}
      aria-busy={isPending}
      aria-disabled={isPending}
      onClick={handleClick}
      className={cn(
        className,
        isPending
          ? "pointer-events-none opacity-70"
          : "",
      )}
    >
      {isPending && pendingChildren
        ? pendingChildren
        : children}
    </Link>
  )
}
