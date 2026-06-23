# 🏥 MediDesk

> A full-stack healthcare management platform that streamlines appointment booking, medical record management, and doctor-patient communication through a role-based system.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [Authentication & Security](#-authentication--security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role-Based Access Control](#-role-based-access-control)

---

## 🔍 Overview

**MediDesk** is a full-stack healthcare desk management system designed to connect patients, doctors, and administrators on a single platform. It provides:

- A **Node.js + Express REST API** backend with MongoDB for persistent storage
- A **React + Vite frontend** with a dark-themed, role-aware dashboard UI
- Secure **JWT authentication** with role-based access control
- Real-time **in-app notifications** triggered by key healthcare events

---

## ✨ Features

### 👤 Authentication
- User registration and login with email/password
- JWT-based stateless authentication (tokens expire in 5 hours)
- Passwords hashed using **bcryptjs** with 10 salt rounds
- Input validation on all auth endpoints via **express-validator**
- Rate limiting on auth routes: **max 10 requests per IP per 15 minutes** to prevent brute-force attacks

### 📅 Appointment Management
- Patients can book appointments by selecting a doctor, date, and reason
- Doctors and Admins can update appointment status (`Scheduled`, `Completed`, `Canceled`)
- Patients or Admins can delete/cancel appointments
- Search appointments by patient name (regex-based, case-insensitive)
- Role-filtered views: doctors see their own appointments, patients see their own

### 🗂️ Medical Records
- Doctors can create detailed medical records tied to a specific appointment
- Diagnosis, prescription, and clinical notes recorded per visit
- Patients can view their own records; doctors can query by patient ID

### 🔔 Notifications
- Automatic in-app notifications triggered on key events:
  - Doctor is notified when a patient books an appointment
  - Patient is notified when their appointment status changes
- Notifications panel in the UI header, auto-polling every 30 seconds
- Bulk mark-as-read when opening the notification drawer

### 📊 Admin Reports
- System statistics: total patients, doctors, appointments this month, completion rate
- Doctor activity report: top 5 most-booked doctors via MongoDB aggregation

### 👥 User Management (Admin)
- View all users (passwords excluded)
- Delete users by ID
- View all doctors (accessible to any authenticated user, for booking)
- Update profile name and change password

---

## 🛠️ Tech Stack

### Backend

| Technology            | Purpose                              |
|-----------------------|--------------------------------------|
| Node.js               | JavaScript runtime                   |
| Express.js v5         | HTTP framework                       |
| MongoDB               | NoSQL database                       |
| Mongoose v8           | ODM for MongoDB                      |
| JSON Web Tokens       | Stateless authentication             |
| bcryptjs              | Password hashing                     |
| express-validator     | Input validation                     |
| express-rate-limit    | Brute-force protection               |
| cors                  | Cross-Origin Resource Sharing        |
| dotenv                | Environment variable management      |

### Frontend

| Technology            | Purpose                              |
|-----------------------|--------------------------------------|
| React 18              | UI library                           |
| Vite 5                | Build tool & dev server              |
| React Router DOM v6   | Client-side routing                  |
| Axios                 | HTTP client with JWT interceptor     |
| Lucide React          | Icon library                         |
| Vanilla CSS           | Custom dark-theme design system      |

---

## 📁 Project Structure

```
Medidesk/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js            # Register & Login logic
│   │   ├── userController.js            # User CRUD & profile management
│   │   ├── appointmentController.js     # Appointment CRUD + search
│   │   ├── medicalRecordController.js   # Medical record creation & retrieval
│   │   ├── notificationController.js    # Notification creation & read status
│   │   └── reportController.js         # Admin stats & doctor activity reports
│   ├── middleware/
│   │   └── authMiddleware.js            # JWT verification middleware
│   ├── models/
│   │   ├── User.js                      # User schema (patient | doctor | admin)
│   │   ├── Appointment.js               # Appointment schema
│   │   ├── MedicalRecord.js             # Medical record schema
│   │   └── Notification.js              # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js                # POST /api/auth/register, /login
│   │   ├── userRoutes.js                # GET/PUT/DELETE /api/users
│   │   ├── appointmentRoutes.js         # CRUD /api/appointments
│   │   ├── medicalRecordRoutes.js       # CRUD /api/records
│   │   ├── notificationRoutes.js        # GET/PUT /api/notifications
│   │   └── reportRoutes.js             # GET /api/reports
│   ├── .env                             # Environment configuration (do not commit)
│   ├── package.json
│   └── server.js                        # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js                 # All API calls + Axios interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Auth state (token + decoded user)
│   │   ├── components/
│   │   │   ├── Layout.jsx               # Sidebar + header + notification drawer
│   │   │   ├── ProtectedRoute.jsx       # Route guard — redirects if not logged in
│   │   │   ├── BookModal.jsx            # Book appointment modal
│   │   │   └── MedRecordModal.jsx       # Create medical record modal
│   │   ├── pages/
│   │   │   ├── Login.jsx                # Login page
│   │   │   ├── Register.jsx             # Register page
│   │   │   └── Dashboard.jsx            # Role-aware dashboard container
│   │   ├── views/
│   │   │   ├── PatientView.jsx          # Patient's tabbed dashboard
│   │   │   ├── DoctorView.jsx           # Doctor's tabbed dashboard
│   │   │   └── AdminView.jsx            # Admin's tabbed dashboard
│   │   ├── App.jsx                      # Router + route declarations
│   │   ├── main.jsx                     # React DOM root
│   │   └── index.css                    # Global dark-theme design system
│   ├── index.html                       # HTML entry point
│   ├── package.json
│   └── vite.config.js                   # Vite config with /api proxy
│
└── README.md
```

---

## 🏗️ Architecture & Data Flow

```
Browser (React SPA — localhost:3000)
        │
        │  All /api/* requests → proxied by Vite dev server
        ▼
Express Server (localhost:5000)
        │
        ├── Rate Limiter  (auth routes only: 10 req / 15 min / IP)
        ├── CORS
        ├── express.json() body parser
        │
        ▼
  Route Layer  /api/*
        │
        ├── authMiddleware.js   ◄── Reads x-auth-token header
        │                            Verifies JWT → attaches { id, role } to req.user
        ▼
  Controller Layer
        │
        ├── Validates input  (express-validator)
        ├── Enforces role-based access
        ├── Performs DB operations via Mongoose models
        └── Triggers side-effects  (e.g., createNotification)
        │
        ▼
  MongoDB (localhost:27017/medidesk)
```

**Notification trigger flow:**
1. Patient books appointment → doctor receives an in-app notification.
2. Doctor / Admin changes appointment status → patient receives an in-app notification.
3. Frontend polls `GET /api/notifications` every 30 seconds.
4. Opening the notification drawer calls `PUT /api/notifications/read` to bulk-mark all as read.

**Frontend routing:**

| Path         | Component         | Guard        |
|--------------|-------------------|--------------|
| `/login`     | `Login.jsx`       | Public       |
| `/register`  | `Register.jsx`    | Public       |
| `/dashboard` | `Dashboard.jsx`   | Requires JWT |
| `*`          | Redirect to login | —            |

---

## 🗃️ Data Models

### User
```js
{
  name:          String  (required),
  email:         String  (required, unique),
  password:      String  (required, hashed),
  role:          'patient' | 'doctor' | 'admin'  (default: 'patient'),
  register_date: Date
}
```

### Appointment
```js
{
  patientId:  ObjectId → User  (required),
  doctorId:   ObjectId → User  (required),
  date:       Date  (required),
  reason:     String  (required),
  status:     'Scheduled' | 'Completed' | 'Canceled'  (default: 'Scheduled'),
  createdAt:  Date
}
```

### MedicalRecord
```js
{
  patientId:     ObjectId → User,
  doctorId:      ObjectId → User,
  appointmentId: ObjectId → Appointment,
  date:          Date,
  diagnosis:     String  (required),
  prescription:  String,
  notes:         String
}
```

### Notification
```js
{
  userId:    ObjectId → User,
  message:   String  (required),
  link:      String  (default: '#'),
  isRead:    Boolean  (default: false),
  createdAt: Date
}
```

---

## 📡 API Reference

All protected routes require the header:
```
x-auth-token: <JWT_TOKEN>
```

### 🔐 Auth — `/api/auth`

| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/api/auth/register`  | Public  | Register a new user      |
| POST   | `/api/auth/login`     | Public  | Login and receive a JWT  |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "patient" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Both return:**
```json
{ "token": "<JWT>" }
```

---

### 👥 Users — `/api/users`

| Method | Endpoint                     | Role        | Description              |
|--------|------------------------------|-------------|--------------------------|
| GET    | `/api/users`                 | Admin       | Get all users            |
| GET    | `/api/users/doctors`         | Any (auth)  | Get all doctors          |
| GET    | `/api/users/:id`             | Any (auth)  | Get a user by ID         |
| PUT    | `/api/users/profile`         | Any (auth)  | Update own name          |
| PUT    | `/api/users/change-password` | Any (auth)  | Change own password      |
| DELETE | `/api/users/:id`             | Admin       | Delete a user            |

---

### 📅 Appointments — `/api/appointments`

| Method | Endpoint                | Role                 | Description                                       |
|--------|-------------------------|----------------------|---------------------------------------------------|
| GET    | `/api/appointments`     | Any (auth)           | Get appointments (role-filtered); `?search=name` |
| POST   | `/api/appointments`     | Patient              | Book a new appointment                            |
| PUT    | `/api/appointments/:id` | Patient/Doctor/Admin | Update appointment status                         |
| DELETE | `/api/appointments/:id` | Patient / Admin      | Delete an appointment                             |

**POST body:**
```json
{ "doctorId": "<ObjectId>", "date": "2025-07-15T10:00:00.000Z", "reason": "Routine checkup" }
```

---

### 🗂️ Medical Records — `/api/records`

| Method | Endpoint                  | Role    | Description                      |
|--------|---------------------------|---------|----------------------------------|
| GET    | `/api/records`            | Patient | Get own medical records          |
| GET    | `/api/records/:patientId` | Doctor  | Get a specific patient's records |
| POST   | `/api/records`            | Doctor  | Create a new medical record      |

**POST body:**
```json
{
  "patientId": "<ObjectId>",
  "appointmentId": "<ObjectId>",
  "diagnosis": "Common cold",
  "prescription": "Paracetamol 500mg",
  "notes": "Rest for 3 days"
}
```

---

### 🔔 Notifications — `/api/notifications`

| Method | Endpoint                   | Access     | Description                    |
|--------|----------------------------|------------|--------------------------------|
| GET    | `/api/notifications`       | Any (auth) | Get all notifications for self |
| PUT    | `/api/notifications/read`  | Any (auth) | Mark all notifications as read |

---

### 📊 Reports — `/api/reports`

| Method | Endpoint                       | Role  | Description                             |
|--------|--------------------------------|-------|-----------------------------------------|
| GET    | `/api/reports/stats`           | Admin | System stats (patients, doctors, rates) |
| GET    | `/api/reports/doctor-activity` | Admin | Top 5 most booked doctors               |

**Stats response:**
```json
{
  "totalPatients": 120,
  "totalDoctors": 15,
  "appointmentsThisMonth": 34,
  "completionRate": "72.50"
}
```

---

## 🔒 Authentication & Security

| Mechanism            | Detail                                                                 |
|----------------------|------------------------------------------------------------------------|
| **Token Type**       | JWT signed with `HS256`, sent via `x-auth-token` header               |
| **Token Expiry**     | 5 hours                                                                |
| **Password Hashing** | bcryptjs with 10 salt rounds                                           |
| **Rate Limiting**    | Auth routes: max **10 requests per IP per 15 minutes**                 |
| **CORS**             | Enabled globally via `cors()` middleware                               |
| **Input Validation** | All write operations validated using `express-validator`               |
| **Frontend Storage** | JWT stored in `localStorage` under key `md_token`                     |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

---

### 1. Clone the Repository

```bash
git clone https://github.com/dharanesh-vn/Medidesk.git
cd Medidesk
```

---

### 2. Start the Backend

```bash
cd backend
npm install
```

Create your environment file (`.env` is already included with defaults):

```bash
# backend/.env is pre-configured for local development
# Edit MONGO_URI and JWT_SECRET as needed
```

Start the backend server:

```bash
node server.js
```

> The API will be available at **`http://localhost:5000`**
> You should see: `MongoDB Connected... Backend server started on port 5000`

---

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

> The frontend will be available at **`http://localhost:3000`**
> All `/api` requests are automatically proxied to the backend at port 5000.

---

### 4. Create Your First Admin

Register a user via the API (admin role can only be set via API or directly in MongoDB):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@medidesk.com","password":"admin123","role":"admin"}'
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB connection URI
MONGO_URI=mongodb://localhost:27017/medidesk

# JWT signing secret — use a long random string in production
JWT_SECRET=your_very_secure_secret_here

# Port for the Express server
PORT=5000
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🛡️ Role-Based Access Control

MediDesk enforces three user roles with distinct permissions:

| Action                            | Patient | Doctor | Admin |
|-----------------------------------|:-------:|:------:|:-----:|
| Register / Login                  | ✅      | ✅     | ✅    |
| View all doctors                  | ✅      | ✅     | ✅    |
| Book appointments                 | ✅      | ❌     | ❌    |
| View own appointments             | ✅      | ✅     | ✅    |
| Update appointment status         | ✅*     | ✅     | ✅    |
| Delete appointment                | ✅      | ❌     | ✅    |
| View own medical records          | ✅      | ❌     | ❌    |
| View patient medical records      | ❌      | ✅     | ❌    |
| Create medical records            | ❌      | ✅     | ❌    |
| Receive & read notifications      | ✅      | ✅     | ✅    |
| View all users                    | ❌      | ❌     | ✅    |
| Delete users                      | ❌      | ❌     | ✅    |
| Access admin reports & stats      | ❌      | ❌     | ✅    |

> *Patients can cancel their own scheduled appointments.

---

## 🖥️ Frontend Dashboard Overview

Each role gets a dedicated, tab-navigated dashboard:

### Patient Dashboard
| Tab           | Content                                                    |
|---------------|------------------------------------------------------------|
| Overview      | Stats cards + upcoming appointments summary                |
| Appointments  | Full list with Book Appointment button + cancel option     |
| Medical Records | Complete history of diagnoses, prescriptions, and notes |

### Doctor Dashboard
| Tab            | Content                                                        |
|----------------|----------------------------------------------------------------|
| Appointments   | Patient appointment table with complete/cancel/add-record actions + search |
| Patient Records | Select a patient to view or create their medical records     |

### Admin Dashboard
| Tab      | Content                                                    |
|----------|------------------------------------------------------------|
| Overview | System stats cards + top-performing doctors                |
| Users    | Full user list with role badges and delete controls        |
| Reports  | Detailed stats + doctor activity table with activity bars  |

---

## 📌 Notes

- The **JWT token** is sent as the `x-auth-token` header on every protected request.
- The **Vite dev proxy** maps all `/api/*` frontend requests to `http://localhost:5000` — no CORS issues in development.
- All timestamps are stored and returned in **UTC**.
- The `admin` role cannot be assigned through the UI registration form — it must be set via the API directly or through MongoDB.
