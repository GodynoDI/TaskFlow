import { BoardColumn } from './components/BoardColumn'
import { useBoardStore } from './store/boardStore'

function App() {
  const { boards, activeBoardId } = useBoardStore()
  const activeBoard = boards.find((board) => board.id === activeBoardId)

  if (!activeBoard) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">TaskFlow</h1>
          <p className="app-subtitle">Нет доступных досок. Добавьте первую, чтобы начать работу.</p>
        </header>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">{activeBoard.title}</h1>
        {activeBoard.description && (
          <p className="app-subtitle">{activeBoard.description}</p>
        )}
      </header>
      <main className="board-layout">
        {activeBoard.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}
      </main>
    </div>
  )
}

export default App
