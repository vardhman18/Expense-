# BudgetBuddy

BudgetBuddy is a modern personal finance manager web application built with **React (Vite)** for the frontend and **Express.js** for the backend. It helps you track expenses, manage budgets, set savings goals, and more.

---

## Features

- 📊 Dashboard with financial overview
- 💰 Transaction management (add, edit, delete)
- 🗂️ Category management
- 🔁 Recurring transactions
- 🎯 Financial goals & savings tracking
- 🧾 Bill reminders
- 📈 Analytics and trends
- 💸 Expense splitting
- 🌗 Dark mode support
- 🔒 JWT-based authentication

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Headless UI
- **Backend:** Express.js, Node.js, JWT
- **API:** RESTful endpoints

---

## Project Structure

```
budgetbuddy/
├── frontend/   # React (Vite) app
│   └── src/
│       └── config/api.js   # API helper functions
├── backend/    # Express.js server
│   └── server.js
└── vercel.json # Vercel deployment config (if used)
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/budgetbuddy.git
cd budgetbuddy
```

### 2. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```

### 3. Environment Variables

#### Backend (`backend/.env`)

```
PORT=5001
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

#### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5001/api
```

### 4. Run Locally

#### Start Backend

```bash
cd backend
npm start
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

### Deploy Frontend and Backend on Vercel

- **Frontend:** Deploy the `frontend` directory as a static site.
- **Backend:** Deploy the `backend` as a serverless function or use a platform like [Render](https://render.com/) for persistent backend.

**Update `VITE_API_URL` in the frontend to point to your deployed backend URL.**

---

## API Reference

All API calls are managed in [`frontend/src/config/api.js`](frontend/src/config/api.js):

- **Authentication:** `login`, `logout`, `isAuthenticated`
- **Transactions:** `getTransactions`, `addTransaction`, `updateTransaction`, `deleteTransaction`
- **Categories:** `getCategories`
- **Recurring:** `getRecurringTransactions`
- **Goals:** `getFinancialGoals`, `getSavingsGoals`, `addSavingsGoal`, `contributeSavingsGoal`
- **Budgets:** `getBudgets`, `updateBudget`
- **Bill Reminders:** `getBillReminders`, `addBillReminder`, `updateBillReminder`, `deleteBillReminder`
- **Analytics:** `getBudgetAnalytics`, `getBudgetTrends`
- **Expense Splits:** `getExpenseSplits`, `createExpenseSplit`, `settleExpenseSplit`

---

## License

MIT

---

