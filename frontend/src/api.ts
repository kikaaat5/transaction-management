import type { NewTransaction, Transaction } from './types'

const BASE_URL = '/api/transactions'

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    throw new Error(`Failed to load transactions (${res.status})`)
  }
  return res.json()
}

export async function addTransaction(data: NewTransaction): Promise<Transaction> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`Failed to add transaction (${res.status})`)
  }
  return res.json()
}
