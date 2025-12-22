import { useState } from 'react'
import { BoardColumn } from './components/BoardColumn'
import { TaskModal } from './components/TaskModal'
import { useBoardStore } from './store/boardStore'
import './App.scss'

function App() {
  const [isModalOpen, setModalOpen] = useState(false)
  const { boards, activeBoardId } = useBoardStore()
  const activeBoard = boards.find((board) => board.id === activeBoardId)

  if (!activeBoard) {
    return (
      <div className="board-page">
        <header className="board-page__header">
          <h1 className="board-page__title">TaskFlow</h1>
          <p className="board-page__subtitle">Нет доступных досок. Добавьте первую, чтобы начать работу.</p>
        </header>
      </div>
    )
  }

  return (
    <div className="board-page">
      <header className="board-page__header">
        <div>
          <h1 className="board-page__title">{activeBoard.title}</h1>
          {activeBoard.description && (
            <p className="board-page__subtitle">{activeBoard.description}</p>
          )}
        </div>
        <div className="board-page__actions">
          <button className="btn btn_type_primary" onClick={() => setModalOpen(true)}>
            + Добавить задачу
          </button>
        </div>
      </header>
      <main className="board-page__columns">
        {activeBoard.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}
      </main>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        columns={activeBoard.columns}
        initialColumnId={activeBoard.columns[0]?.id}
      />
    </div>
  )
}

export default App
