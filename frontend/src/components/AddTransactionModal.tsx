import { useState } from 'react'
import type { FormEvent } from 'react'
import { addTransaction } from '../api'
import type { Transaction } from '../types'

interface Props {
  onClose: () => void
  onAdded: (tx: Transaction) => void
}

export function AddTransactionModal({ onClose, onAdded }: Props) {
  const [transactionDate, setTransactionDate] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const created = await addTransaction({
        transactionDate,
        accountNumber,
        accountHolderName,
        amount: Number(amount),
      })
      onAdded(created)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">Add Transaction</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Transaction Date
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </label>

          <label>
            Account Number
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234-5678-9012"
              required
            />
          </label>

          <label>
            Account Holder Name
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
