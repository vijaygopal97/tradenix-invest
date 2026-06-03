# Tradenix Venture

Web-based investment and credit growth platform (MERN stack).

## Prerequisites

- Node.js 18+
- MongoDB Community Edition (running locally or a connection URI)

## Project structure

```
tradenix-venture/
  backend/   Express API, MongoDB, JWT, file uploads
  frontend/  React (Vite) user + admin dashboards
```

## Setup

### 1. MongoDB

Start MongoDB and ensure it listens on `mongodb://127.0.0.1:27017` (or update `MONGODB_URI`).

### 2. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`

Default admin (change after first login):

- Email: `admin@tradenix.com`
- Password: `Admin@123456`

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Features

- **Admin:** dashboard, users, daily interest (prospective rates + history), platform bank details, recharge approval, withdrawal processing with payment proof
- **User:** register/login, invest with screenshot upload, live balance accrual (24h daily rate), withdrawals, transaction history
- **Security:** bcrypt passwords, JWT, role-based routes, validation, rate limiting, image-only uploads

## Production notes

- Set strong `JWT_SECRET` and unique admin credentials
- Use HTTPS and a production MongoDB URI
- Point `CLIENT_URL` and `VITE_API_URL` to your deployed domains
- Back up `backend/uploads` or move to object storage (S3, etc.)

## Support

Post-delivery bug support window: 30 days (per project proposal).
