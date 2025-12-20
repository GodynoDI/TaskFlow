import { BoardColumn, type BoardColumnData } from './components/BoardColumn'

const mockColumns: BoardColumnData[] = [
  {
    id: 'col-1',
    title: 'бэклог',
    accentColor: '#f2c94c',
    tasks: [
      {
        id: 'task-1',
        title: '1',
        description: '1',
        priority: 'medium',
        dueDate: '1',
        tags: ['task1', 'col1'],
        assignee: { name: '11111111', initials: '1' },
        subtasks: { completed: 1, total: 3 },
      },
    ],
  },
  {
    id: 'col-2',
    title: 'В работе',
    accentColor: '#6d5efc',
    tasks: [
      {
        id: 'task-2',
        title: '2',
        description: '2',
        priority: 'high',
        assignee: { name: '22222222', initials: '2' },
        subtasks: { completed: 2, total: 4 },
      },
      {
        id: 'task-3',
        title: '3',
        priority: 'low',
        tags: ['task3'],
        assignee: { name: '3333333', initials: '3' },
        subtasks: { completed: 0, total: 2 },
      },
    ],
  },
  {
    id: 'col-3',
    title: 'Готово',
    accentColor: '#10b981',
    tasks: [
      {
        id: 'task-4',
        title: '4',
        description: '4',
        priority: 'low',
        tags: ['col3'],
        assignee: { name: '44444444444', initials: '4' },
        subtasks: { completed: 3, total: 4 },
      },
    ],
  },
]

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">TaskFlow</h1>
        <p className="app-subtitle">
          Доска-досточка
        </p>
      </header>
      <main className="board-layout">
        {mockColumns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}
      </main>
    </div>
  )
}

export default App
