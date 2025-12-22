import './BoardEmptyState.scss'

interface BoardEmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'default' | 'filters'
}

export function BoardEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  tone = 'default',
}: BoardEmptyStateProps) {
  return (
    <section
      className={['board-empty-state', tone === 'filters' ? 'board-empty-state_tone_filters' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <h2 className="board-empty-state__title">{title}</h2>
      {description && <p className="board-empty-state__description">{description}</p>}
      {actionLabel && onAction && (
        <button className="btn btn_type_secondary board-empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  )
}
