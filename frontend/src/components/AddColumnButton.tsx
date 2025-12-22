import './AddColumnButton.scss'

interface AddColumnButtonProps {
  onClick: () => void
}

export function AddColumnButton({ onClick }: AddColumnButtonProps) {
  return (
    <button type="button" className="add-column-button" onClick={onClick}>
      <span className="add-column-button__icon">+</span>
      <span>Добавить колонку</span>
    </button>
  )
}
