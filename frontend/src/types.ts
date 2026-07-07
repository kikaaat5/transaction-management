export type TransactionStatus = 'Pending' | 'Settled' | 'Failed'

export interface Transaction {
  transactionDate: string
  accountNumber: string
  accountHolderName: string
  amount: number
  status: TransactionStatus
}

export interface NewTransaction {
  transactionDate: string
  accountNumber: string
  accountHolderName: string
  amount: number
}
