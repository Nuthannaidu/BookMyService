# 📅 BookMyServices — Full Stack Appointment Booking System

![Status](https://img.shields.io/badge/Status-Active-success)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**BookMyServices** is a robust, full-stack scheduling platform designed to bridge the gap between service providers and customers. Whether for medical consultations, salon appointments, or vehicle rentals, this application streamlines the booking process with real-time availability checks, role-based dashboards, and automated status tracking.

---

## 🚀 Key Features

### 👤 Customer Experience
* **Secure Access:** JWT-encrypted registration and login.
* **Service Discovery:** Browse a wide range of services categorized by industry (Medical, Salon, Rentals).
* **Smart Booking:** Real-time slot availability checks prevent double-booking.
* **Personal Dashboard:** Comprehensive history of past and upcoming appointments with live status updates.

### 👨‍⚕️ Provider Tools
* **Business Hub:** A centralized dashboard to manage services and bookings.
* **Service Management:** Full CRUD capabilities to list new services with industry-specific details.
* **Availability Control:** Define custom working hours and off-days.
* **Request Handling:** Accept or reject incoming booking requests with a single click.
* **Smart Notifications:** Real-time "Bell" alerts for pending actions.
* **Automated Lifecycle:** System automatically marks appointments as `Completed` once the scheduled time passes.

---

## 🔄 Appointment Lifecycle Architecture

The system implements a state-machine logic to handle appointment statuses automatically:

1.  **Pending:** Initial state upon customer booking. Awaits provider action.
2.  **Accepted:** Provider confirms the slot. Customer is notified.
3.  **Completed:** Server-side logic automatically transitions the status when `Current Time > End Time`.

---

## 🛠 Tech Stack

| Layer | Technology | Utility |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | High-performance component-based UI |
| | Tailwind CSS | Modern, utility-first styling |
| | Axios | Interceptor-based HTTP requests |
| **Backend** | Node.js & Express | Scalable REST API architecture |
| | JWT | Stateless, secure authentication |
| **Database** | MongoDB & Mongoose | Flexible NoSQL schema modeling |
| **Infrastructure** | Render | CI/CD deployment for web and API |

---

## 🔐 Security & Authorization

* **Role-Based Access Control (RBAC):** Middleware strictly segregates `User` vs. `Provider` routes.
* **Data Isolation:** Providers can only modify resources they personally own (Ownership Enforcement).
* **Protected Routes:** Higher-Order Components (HOC) in React prevent unauthorized page access.

---

## 📡 API Reference

### Authentication
* `POST /api/auth/register` - Create a new account (User/Provider).
* `POST /api/auth/login` - Authenticate and retrieve Bearer token.

### Service Management
* `GET /api/services` - Public listing of all services.
* `POST /api/services` - **[Provider]** Create a new service listing.
* `PUT /api/services/:id` - **[Provider]** Update service details.
* `DELETE /api/services/:id` - **[Provider]** Remove a listing.

### Appointment Operations
* `POST /api/appointments/book` - Reserve a time slot.
* `GET /api/appointments/provider` - **[Provider]** Fetch business bookings.
* `PATCH /api/appointments/:id/status` - **[Provider]** Approve/Reject bookings.

---

## 🗄 Database Schema (MongoDB)

The data model uses normalized references (`ObjectId`) to maintain data integrity.

### User Model
```javascript
{
  name: String,
  email: { type: String, unique: true },
  password: String, // Hashed
  role: { type: String, enum: ["user", "provider"] }
}
```
### Service Model
Supports dynamic fields based on category.

```JavaScript
{
  provider: { type: ObjectId, ref: 'User' },
  name: String,
  category: { type: String, enum: ['medical', 'saloon', 'car_rental'] },
  price: Number,
  duration: Number, // Minutes
  details: Object // Dynamic sub-schema based on category
}
```
▶️ Local Installation Guide
Prerequisites: Node.js (v14+) and MongoDB installed.

### Clone the Repository
```
Bash
git clone [https://github.com/your-username/bookmyservices.git](https://github.com/your-username/bookmyservices.git)
cd bookmyservices
```
### Backend Configuration
```
Bash

cd backend
npm install
Create a .env file:
```
Code snippet
```
MONGO_URI=mongodb://localhost:27017/bookmyservices
JWT_SECRET=your_super_secret_key
PORT=5000
Start API Server:

Bash

npm run dev
Frontend Configuration

Bash

cd ../frontend
npm install
npm run dev
Access: Open http://localhost:5173 in your browser.
```

### 🧠 Engineering Decisions
Logic-Based Completion: Instead of resource-heavy Cron jobs, the "Completed" status is derived logically at runtime by comparing the appointment end time with the current server time.

Atomic Operations: Critical status updates use atomic database operations to prevent race conditions during concurrent booking requests.

Scalable Folder Structure: The codebase separates controllers, models, and routes to ensure maintainability as the application grows.
