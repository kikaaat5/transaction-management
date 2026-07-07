import type { Transaction } from '../types'

interface Props {
  transactions: Transaction[]
}

function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function TransactionTable({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p className="empty">No transactions yet.</p>
  }

  return (
    <div className="table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th>Transaction Date</th>
            <th>Account Number</th>
            <th>Account Holder Name</th>
            <th className="num">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={`${tx.accountNumber}-${i}`}>
              <td>{tx.transactionDate}</td>
              <td>{tx.accountNumber}</td>
              <td>{tx.accountHolderName}</td>
              <td className="num">{formatAmount(tx.amount)}</td>
              <td>
                <span className={`badge badge-${tx.status.toLowerCase()}`}>
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
