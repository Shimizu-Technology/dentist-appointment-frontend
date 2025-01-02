# ISA Dental Frontend

This project is a **React + TypeScript + Vite** front-end for the **ISA Dental** appointment scheduling system. It provides a user-friendly interface for patients (and their dependents) to manage appointments, update insurance info, and communicate with the ISA Dental backend.

---

## Table of Contents

1. [Requirements](#requirements)  
2. [Installation and Setup](#installation-and-setup)  
3. [Project Structure](#project-structure)  
4. [Running Locally](#running-locally)  
5. [Environment Variables](#environment-variables)  
6. [Deployment](#deployment)  
7. [Key Features](#key-features)  
8. [Future Enhancements / Next Steps](#future-enhancements--next-steps)

---

## Requirements

- **Node.js** (v16+ recommended)  
- **npm** (or **yarn**)  
- **Vite** build tool (automatically used when you run the scripts)  

_(Also recommended to run the [ISA Dental Backend](https://github.com/your-organization/dentist-appointment-backend) API for real data. If you don’t have the API running, you can use the mock data approach that’s included.)_

---

## Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-organization/dentist-appointment-frontend.git
   cd dentist-appointment-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

---

## Project Structure

Below is a high-level overview of the directories and key files:

```
dentist-appointment-frontend
├─ public/               # Static assets (favicon, etc.)
├─ src/                  # Application source code
│  ├─ components/        # Reusable React components
│  ├─ pages/             # Page-level components (e.g., /login, /appointments)
│  ├─ hooks/             # Custom React hooks (e.g., useAuth, useInsurance)
│  ├─ lib/               # API calls, mockData, and utility functions
│  ├─ store/             # Zustand store for auth state
│  ├─ types/             # TypeScript type definitions
│  ├─ App.tsx            # Main application routes
│  └─ main.tsx           # Entry point
├─ .env                  # Environment variables (e.g., API_BASE_URL)
├─ package.json          # Scripts, dependencies, etc.
├─ tailwind.config.js    # Tailwind CSS config
├─ tsconfig.json         # TypeScript config
└─ vite.config.ts        # Vite config
```

---

## Running Locally

1. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   By default, this will launch on **http://localhost:5173** (or the next available port).

2. **Open the browser** to see the site.  
   - You can log in with test credentials (if using mock data or your backend’s seeded data).

3. **Sign in / Sign up** as a user or use existing test credentials. Once authenticated, you can:  
   - View and book appointments (including picking a date, time slot, etc.).  
   - Manage dependents.  
   - Update insurance information.  
   - **(If admin)** Access the Admin Dashboard to manage:
     - **Appointments** (view/cancel/reschedule all)
     - **Appointment Types** (CRUD)
     - **Users** (see all users, optionally promote them to admin)

---

## Environment Variables

By default, the client looks for environment variables in `.env`:

- **`API_BASE_URL`**: The base URL for the ISA Dental backend API.  
  Example:  
  ```
  API_BASE_URL=http://localhost:3000/api/v1
  ```

Make sure this matches the address of your running backend API (Rails, Docker, etc.). If not set, it defaults to `http://localhost:3000/api/v1`.

---

## Deployment

Typical steps to deploy a Vite-based React app:

1. **Set `API_BASE_URL`** in your hosting environment or CI/CD build system.  
2. **Build** the production bundle:

   ```bash
   npm run build
   # or
   yarn build
   ```

   This will create a `dist` directory with static files.

3. **Deploy** those static files to a hosting provider (e.g., Netlify, Vercel, AWS S3, etc.).

---

## Key Features

1. **Appointments**  
   - Users can book new appointments, view upcoming ones, and cancel/reschedule if they meet the requirements (e.g., 24+ hours in advance).  
   - Admin can view and manage all appointments.

2. **Dependents**  
   - Users can add/edit dependents.  
   - Manage appointments for your dependents.

3. **Insurance**  
   - Users can view/update their insurance info (provider, policy number, plan type).

4. **Admin Dashboard**  
   - Available only to users with `role === 'admin'`.  
   - **Tabs** for:
     - **Appointments**: Admin sees all appointments site-wide.  
     - **Appointment Types**: Create/edit/delete appointment types.  
     - **Users**: View all user accounts.  
       - **Promote** any user to admin role.

5. **Role-based Access**  
   - Regular users can only manage their own profile/appointments.  
   - Admin sees + manages all appointments, appointment types, and users.

---

## Future Enhancements / Next Steps

- **Additional Form Validations**: Enhance error messages and validation logic for appointments or profile data.  
- **User Notifications**: Integrate real-time notifications (e.g., WebSockets or push notifications) for appointment changes.  
- **Accessibility**: Ensure best practices for screen readers and keyboard navigation.  
- **i18n**: Internationalization support for multiple languages.  
- **Theming**: Support multiple color schemes or branding.  
- **Pagination**: Additional smooth or infinite scrolling pagination for large datasets (e.g., Admin user list).  
