# BudgetBuddy - Personal Finance Manager

BudgetBuddy is a modern web application for managing personal finances, built with React, Vite, and Express.

## Features

- 📊 Dashboard with financial overview
- 💰 Transaction management
- 🌓 Dark mode support
- ⚡ Fast and responsive UI
- 🔒 User settings and preferences

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Headless UI

### Backend
- Express.js
- JSON Web Tokens
- CORS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend server (from frontend directory)
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Project Structure

```
budgetbuddy/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── contexts/
│   ├── package.json
│   └── vite.config.js
│
└── backend/           # Express backend
    ├── server.js
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 