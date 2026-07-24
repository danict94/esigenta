"use client"

import { useEffect, useRef, useState, type RefObject } from "react"

export type DismissableMenu<T extends HTMLElement = HTMLElement> = {
  isOpen: boolean
  containerRef: RefObject<T | null>
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Minimal open/close state for a menu or dropdown: Escape and outside
 * clicks close it. `containerRef` must be attached to the element that
 * wraps both the trigger and the menu content, so clicking the trigger
 * itself doesn't count as "outside". Coordinating mutual exclusion with
 * other menus is the caller's responsibility (call `.close()` on the
 * other instance when opening this one). Pass the element type as a type
 * argument when the container isn't a plain HTMLElement (e.g. a `<div>`).
 */
export function useDismissableMenu<
  T extends HTMLElement = HTMLElement,
>(): DismissableMenu<T> {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target

      if (
        !(target instanceof Node) ||
        !containerRef.current ||
        containerRef.current.contains(target)
      ) {
        return
      }

      setIsOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [isOpen])

  return {
    isOpen,
    containerRef,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((current) => !current),
  }
}
