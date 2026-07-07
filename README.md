# Transaction Management

A simple transaction management system with a **.NET (C#) REST API** backend and a **React + TypeScript** frontend. Transactions are stored in a plain **CSV file**. The UI shows all transactions in a table and lets you add new ones through a modal form; each new transaction is automatically given a random status (`Pending`, `Settled`, or `Failed`) by the API.

This document is written for someone who has **never used .NET, React, Node.js, or Vite before**. Just follow the steps in order.

---

## Table of Contents

1. [How the project is structured](#how-the-project-is-structured)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [AI Usage Summary](#ai-usage-summary)

---

## How the project is structured

```
transaction-management/
├── backend/              The API (.NET 7 / C#)
│   ├── Controllers/      HTTP endpoints (TransactionsController)
│   ├── Models/           Data shapes (Transaction, NewTransactionRequest)
│   ├── Services/         CSV read/write logic (TransactionService)
│   ├── Data/
│   │   └── transactions.csv   The data file (this is your "database")
│   └── Program.cs        App startup / configuration
│
└── frontend/             The web UI (React + TypeScript + Vite)
    ├── src/
    │   ├── components/    TransactionTable, AddTransactionModal
    │   ├── api.ts         Functions that call the backend
    │   ├── types.ts       TypeScript type definitions
    │   └── App.tsx        Main screen
    └── vite.config.ts     Dev server + API proxy settings
```

You will run **two programs at the same time**: the backend (API) and the frontend (website). They talk to each other over HTTP.

---

## Prerequisites

Install the following software **before** you start. Version numbers are the minimums this project was built and tested with.

| Software | Minimum version | What it is | Download |
| --- | --- | --- | --- |
| **.NET SDK** | **7.0** | The toolkit that builds and runs the C# backend. The "SDK" (not just the "Runtime") is required. | https://dotnet.microsoft.com/download/dotnet/7.0 |
| **Node.js** | **20.19+** (LTS 22.x recommended) | Runs JavaScript tools outside the browser; needed to build and serve the frontend. Includes **npm** (the package installer). | https://nodejs.org |

> **Tip:** Node.js and npm are installed together — installing Node.js gives you npm automatically.

### Verify the installs

Open a terminal (PowerShell on Windows, Terminal on macOS/Linux) and run each command. You should see a version number, not an error:

```bash
dotnet --version     # should print 7.x.x (or higher)
node --version       # should print v20.19.x / v22.x or higher
npm --version        # should print 10.x or higher
```

If any command says "not found" or "not recognized", re-install that tool and **close and reopen your terminal** so it picks up the new software.

---

## Installation

Download or clone this repository, then open a terminal in the project's root folder (the one that contains this `README.md`).

### 1. Backend — restore .NET packages

```bash
cd backend
dotnet restore
```

This downloads the C# libraries the API needs. It only has to be done once (and again whenever dependencies change). `dotnet run` also restores automatically, so this step is optional but good to confirm everything works.

### 2. Frontend — install npm packages

Open a **second** terminal (leave the first one for the backend), go to the project root, then:

```bash
cd frontend
npm install
```

This reads `frontend/package.json` and downloads all frontend dependencies into a `node_modules` folder. This can take a minute the first time.

---

## Configuration

This project runs **out of the box with no environment variables required**. The important settings are below, in case you need to change them.

### Ports (where each app runs)

| App | URL | Where it's configured |
| --- | --- | --- |
| Backend API | `http://localhost:5012` | `backend/Properties/launchSettings.json` (the `http` profile) |
| Backend Swagger UI | `http://localhost:5012/swagger` | Enabled automatically in development |
| Frontend website | `http://localhost:5173` | Vite's default (`frontend/vite.config.ts`) |

### How the frontend reaches the backend (the proxy)

The frontend calls the API using relative paths that start with `/api`. During development, Vite **forwards** anything starting with `/api` to the backend and strips the `/api` prefix. This avoids browser cross-origin (CORS) issues.

This is set in `frontend/vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5012',   // <-- backend URL
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

So a browser request to `/api/transactions` actually reaches the backend at `http://localhost:5012/transactions`.

> **If you change the backend port**, update the `target` value above to match.

### The data file

Transaction data lives in **`backend/Data/transactions.csv`**. It ships with sample rows. The columns are:

```
Transaction Date, Account Number, Account Holder Name, Amount, Status
```

New transactions are appended to this file, so your data persists between restarts. To reset the data, edit this file (keep the header row).

---

## Running the Application

You need **both** the backend and the frontend running at the same time, each in its own terminal.

### Step 1 — Start the backend

In your first terminal:

```bash
cd backend
dotnet run --launch-profile http
```

Wait until you see a line similar to:

```
Now listening on: http://localhost:5012
Application started. Press Ctrl+C to shut down.
```

The API is now running. Leave this terminal open.

> **Why `--launch-profile http`?** It runs the API over plain HTTP on port 5012, which matches the frontend proxy and avoids HTTPS certificate prompts during local development.

### Step 2 — Start the frontend

In your second terminal:

```bash
cd frontend
npm run dev
```

Wait until you see something like:

```
VITE ready in 300 ms
➜  Local:   http://localhost:5173/
```

### Step 3 — Open the app

Open **http://localhost:5173** in your web browser. You should see the transaction table with the sample data and an **"Add Transaction"** button.

### Stopping the apps

Press **Ctrl + C** in each terminal to stop that program.

---

## API Documentation

Base URL (direct): `http://localhost:5012`
Through the frontend proxy: `http://localhost:5012` ← `/api/...` from the browser

There are two endpoints.

### 1. Get all transactions

Returns every transaction currently in the CSV file.

```
GET /transactions
```

**Example request**

```bash
curl http://localhost:5012/transactions
```

**Example response** — `200 OK`

```json
[
  {
    "transactionDate": "2025-03-01",
    "accountNumber": "7289-3445-1121",
    "accountHolderName": "Maria Johnson",
    "amount": 150.00,
    "status": "Settled"
  },
  {
    "transactionDate": "2025-03-02",
    "accountNumber": "1122-3456-7890",
    "accountHolderName": "John Smith",
    "amount": 75.50,
    "status": "Pending"
  }
]
```

### 2. Add a new transaction

Adds one transaction. **You do not send a status** — the API assigns a random one (`Pending`, `Settled`, or `Failed`) and saves the row to the CSV.

```
POST /transactions
Content-Type: application/json
```

**Request body fields**

| Field | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `transactionDate` | string | yes | `"2025-07-08"` | Format `YYYY-MM-DD` |
| `accountNumber` | string | yes | `"1234-5678-9012"` | Any text |
| `accountHolderName` | string | yes | `"Jane Doe"` | Any text |
| `amount` | number | yes | `199.99` | Must be `0` or greater |

**Example request**

```bash
curl -X POST http://localhost:5012/transactions \
  -H "Content-Type: application/json" \
  -d '{
        "transactionDate": "2025-07-08",
        "accountNumber": "1234-5678-9012",
        "accountHolderName": "Jane Doe",
        "amount": 199.99
      }'
```

> **Windows PowerShell note:** the `\` line-continuation and single quotes above are for macOS/Linux shells. In PowerShell, put it on one line and use the Swagger UI or `Invoke-RestMethod` instead:
> ```powershell
> Invoke-RestMethod -Method Post -Uri http://localhost:5012/transactions `
>   -ContentType "application/json" `
>   -Body '{"transactionDate":"2025-07-08","accountNumber":"1234-5678-9012","accountHolderName":"Jane Doe","amount":199.99}'
> ```

**Example response** — `201 Created` (note the server-assigned `status`)

```json
{
  "transactionDate": "2025-07-08",
  "accountNumber": "1234-5678-9012",
  "accountHolderName": "Jane Doe",
  "amount": 199.99,
  "status": "Failed"
}
```

**Validation error** — `400 Bad Request` (e.g. a missing field or negative amount)

```json
{
  "errors": {
    "AccountHolderName": ["The AccountHolderName field is required."]
  }
}
```

### Interactive API docs (Swagger)

While the backend is running, open **http://localhost:5012/swagger** in your browser. This gives you a clickable interface to see both endpoints and send test requests without writing any code.

---

## Testing

There is no automated test suite; you verify the app by exercising it. Here are three ways, from easiest to most manual.

### Option A — Through the website (end-to-end)

1. Start both apps (see [Running the Application](#running-the-application)).
2. Open http://localhost:5173.
3. Confirm the table shows the sample transactions.
4. Click **Add Transaction**, fill in the form, and submit.
5. The modal closes and the **new row appears at the bottom of the table** with a randomly assigned status.
6. **Refresh the browser.** The new transaction is still there — proving it was saved to the CSV file.

### Option B — Using Swagger (backend only)

1. Start the backend.
2. Open http://localhost:5012/swagger.
3. Expand `GET /Transactions` → **Try it out** → **Execute**. You should get a `200` with the list.
4. Expand `POST /Transactions` → **Try it out**, edit the example body, → **Execute**. You should get a `201` with a random `status`.
5. Run `GET` again to confirm the new row is included.

### Option C — Using curl (command line)

```bash
# Get all transactions
curl http://localhost:5012/transactions

# Add one (repeat a few times to see the status vary)
curl -X POST http://localhost:5012/transactions \
  -H "Content-Type: application/json" \
  -d '{"transactionDate":"2025-07-08","accountNumber":"0000-1111-2222","accountHolderName":"Test User","amount":10}'
```

### Confirming data is persisted

After adding transactions, open `backend/Data/transactions.csv` in any text editor — the new rows will be there.

### Build checks (optional)

You can confirm both projects compile cleanly:

```bash
cd backend && dotnet build      # should say "Build succeeded"
cd frontend && npm run build     # should finish with "built in ..."
```

---

## Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| `dotnet: command not found` | The .NET SDK isn't installed or the terminal wasn't reopened after installing. Re-check [Prerequisites](#prerequisites). |
| Frontend loads but the table is empty and shows an error | The backend isn't running, or it's on a different port. Start the backend first, and make sure it's on `http://localhost:5012`. |
| `Port 5012 is already in use` | Another program (or a previous run) is using it. Stop the other process, or change the port in `launchSettings.json` **and** the proxy `target` in `vite.config.ts`. |
| Browser shows a CORS error | You're calling the backend directly instead of via `/api`. In development, always let the frontend use the Vite proxy (it's already configured). |
| `npm install` fails | Confirm your Node.js version meets the minimum (`node --version`). Delete the `frontend/node_modules` folder and try again. |
| HTTPS certificate warning | Use the `http` launch profile as documented (`dotnet run --launch-profile http`). |

---

## AI Usage Summary

AI tooling was used as an assistant during this project — mainly to speed up boilerplate, suggest approaches, and help draft parts of this documentation. All design decisions, code, and final output were made and reviewed by developer.
```
