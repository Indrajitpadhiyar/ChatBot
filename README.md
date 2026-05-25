# IDR AI Chatbot

IDR AI Chatbot is a full-stack AI chat application with authentication, project-based chat organization, multiple AI model selection, group AI responses, theme customization, and Razorpay plan upgrades.

## Tech Stack

**Frontend**
- React 19 with Vite
- Tailwind CSS 4
- Framer Motion
- Lucide React icons
- React Markdown with GFM support
- Google OAuth

**Backend**
- Node.js with Express 5
- MongoDB with Mongoose
- JWT authentication
- Google Generative AI
- Razorpay payments
- Multer image uploads

## Project Structure

```text
AiChatbot/
├── backend/
│   ├── public/
│   │   └── uploads/
│   ├── src/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── Routes/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Main Frontend Folders

- `src/components`: reusable UI components such as chat input, chat window, message rendering, login, typing indicator, and model selector.
- `src/layout`: application shell pieces such as header, sidebar, notification toast, group chat modal, and layout wrapper.
- `src/pages`: full-page screens such as settings and pricing.
- `src/constants`: shared configuration such as available AI model metadata.

## Getting Started

### 1. Install Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Start the backend:

```bash
npm run dev
```

### 2. Install Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Available Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Features

- Email/password authentication
- Google OAuth login
- Chat history with rename, pin, archive, delete, share, and move-to-project actions
- Project folders with categories
- Multiple model selector
- Group AI model session modal
- Markdown AI responses
- Editable user and AI messages
- Speech-to-text chat input where browser support is available
- Custom themes with light/dark presets, colors, font scale, chat width, and background images
- Theme persistence to user profile
- Pricing page with Razorpay payment flow

## Notes

- Run the backend on port `5000` or update `VITE_API_URL`.
- MongoDB must be available before starting the backend.
- Razorpay checkout requires valid Razorpay keys.
- Google login requires matching OAuth credentials for the frontend origin.
