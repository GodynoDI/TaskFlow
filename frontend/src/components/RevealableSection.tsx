import type { ReactNode } from 'react'
import './RevealableSection.scss'

interface RevealableSectionProps {
  isOpen: boolean
  title: string
  triggerLabel: string
  onOpen: () => void
  onClose: () => void
  children: ReactNode
}

export function RevealableSection({
  isOpen,
  title,
  triggerLabel,
  onOpen,
  onClose,
  children,
}: RevealableSectionProps) {
  if (!isOpen) {
    return (
      <button type="button" className="revealable-section__trigger" onClick={onOpen}>
        {triggerLabel}
      </button>
    )
  }

  return (
    <div className="revealable-section">
      <div className="revealable-section__header">
        <span>{title}</span>
        <button type="button" className="revealable-section__close" onClick={onClose} aria-label="Скрыть">
          ×
        </button>
      </div>
      <div className="revealable-section__content">{children}</div>
    </div>
  )
}
