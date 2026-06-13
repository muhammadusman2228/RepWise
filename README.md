# RepWise - Premium Fitness Tracker Dashboard

RepWise is a premium MERN-stack fitness tracker designed to help athletes plan, log, and analyze their workout sessions. It features a modern, high-contrast light-themed dashboard, dynamic metrics calculations (Lifted Volume, Duration, Workout Counts, and average RPE), and responsive layouts for desktop and mobile devices.

---

## 🚀 Key Features

*   **Premium Redesigned UI**: A responsive three-column grid layout on desktop that collapses to a sticky bottom tab bar on mobile.
*   **Dynamic Analytics**:
    *   **Activity Load Bar Chart**: Renders daily workload using custom CSS graphic bars.
    *   **Exercise Categories Breakdown**: Interactive progress circle calculating percentage splits dynamically from logged database values.
    *   **Workout Volume Tracker**: Inline SVG chart rendering lifting trends over time.
*   **Advanced Workout Logger**: Nested forms supporting dynamic exercise logging, sets management, and optional RPE scale mappings.
*   **Secure Authentication**:
    *   JWT route guards.
    *   Joi validation middleware with detailed feedback array outputs.
    *   Post-registration email token verification.
    *   Password visibility toggle buttons.
*   **Unified Production Setup**: Serves compiled SPA React bundles straight from the Express backend in production mode.

---

## 🛠️ Technology Stack

*   **Backend**: Node.js, Express, MongoDB (Mongoose), Nodemailer, Joi, JWT, Bcrypt.
*   **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide Icons, React Router.
*   **DevOps**: Docker, multi-stage alpine builds.

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v20+) and [MongoDB](https://www.mongodb.com/) installed.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd fitness-app
```

### 3. Backend Setup
Create a `.env` file inside the `backend/` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRETS=your_secret_key

# Email SMTP Verification Config
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME="RepWise Tracker"

# CORS & Base URLs
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

Install backend dependencies and run the server:
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup
Install frontend dependencies and start Vite dev server:
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker & Render Deployment

RepWise is configured to build and deploy as a single, unified container. Serving the frontend from the backend simplifies routing, avoids CORS errors, and reduces hosting costs.

### How to Deploy on Render:
1.  Create a new **Web Service** on Render.
2.  Link your Git repository.
3.  Select **Docker** as the Runtime environment.
4.  Configure the following Environment Variables on Render:
    *   `NODE_ENV`: `production`
    *   `PORT`: `3000`
    *   `MONGO_URI`: Your MongoDB database connection string.
    *   `JWT_SECRETS`: Your JWT secret string.
    *   `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`: Your email verification SMTP details.
5.  Deploy. Render will automatically build the multi-stage [Dockerfile](Dockerfile) and launch your application!
