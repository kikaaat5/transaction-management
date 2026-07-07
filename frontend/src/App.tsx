import { useEffect, useState } from 'react'
import { getTransactions } from './api'
import type { Transaction } from './types'
import { TransactionTable } from './components/TransactionTable'
import { AddTransactionModal } from './components/AddTransactionModal'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load transactions'),
      )
      .finally(() => setLoading(false))
  }, [])

  function handleAdded(tx: Transaction) {
    setTransactions((prev) => [...prev, tx])
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Transaction Management</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          Add Transaction
        </button>
      </header>

      {loading && <p className="status-msg">Loading transactions…</p>}
      {error && <p className="status-msg error">{error}</p>}
      {!loading && !error && <TransactionTable transactions={transactions} />}

      {modalOpen && (
        <AddTransactionModal
          onClose={() => setModalOpen(false)}
          onAdded={handleAdded}
        />
      )}
    </main>
  )
}

export default App
