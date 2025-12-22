import './BoardToolbar.scss'
import type { PriorityFilter, SortMode } from '../types/filters'

interface BoardToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  priorityFilter: PriorityFilter
  onPriorityChange: (value: PriorityFilter) => void
  sortMode: SortMode
  onSortModeChange: (value: SortMode) => void
  columnCount: number
  visibleTasks: number
  totalTasks: number
}

export function BoardToolbar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  sortMode,
  onSortModeChange,
  columnCount,
  visibleTasks,
  totalTasks,
}: BoardToolbarProps) {
  return (
    <section className="board-toolbar" aria-label="Панель управления доской">
      <div className="board-toolbar__controls">
        <label className="board-toolbar__control board-toolbar__control_type_search">
          <span>Поиск</span>
          <input
            type="search"
            placeholder="Поиск задач по названию, описанию или тегам"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label className="board-toolbar__control">
          <span>Приоритет</span>
          <select
            value={priorityFilter}
            onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
          >
            <option value="all">Все</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </label>
        <label className="board-toolbar__control">
          <span>Сортировка</span>
          <select value={sortMode} onChange={(event) => onSortModeChange(event.target.value as SortMode)}>
            <option value="priority">По приоритету</option>
            <option value="alphabetical">По алфавиту</option>
            <option value="dueDateAsc">По сроку ↑</option>
            <option value="dueDateDesc">По сроку ↓</option>
          </select>
        </label>
        <div className="board-toolbar__metrics" aria-live="polite">
          <span>Колонок: {columnCount}</span>
          <span>Задачи: {visibleTasks}</span>
          {visibleTasks !== totalTasks && <span>Всего: {totalTasks}</span>}
        </div>
      </div>
    </section>
  )
}
