# ISA Dental Frontend

This project is a **React + TypeScript + Vite** front-end for the **ISA Dental** appointment scheduling system. It provides a user-friendly interface for patients (and their dependents) to manage appointments, update insurance info, and communicate with the ISA Dental backend. In addition, it integrates with AWS S3 if you’re displaying dentist images that have been uploaded from the backend.

---

## Table of Contents

1. [Requirements](#requirements)  
2. [Installation and Setup](#installation-and-setup)  
3. [Project Structure](#project-structure)  
4. [Running Locally](#running-locally)  
5. [Environment Variables](#environment-variables)  
6. [Deployment](#deployment)  
7. [Key Features](#key-features)  
8. [AWS S3 Integration (Images)](#aws-s3-integration-images)
9. [Future Enhancements / Next Steps](#future-enhancements--next-steps)

---

## Requirements

- **Node.js** (v16+ recommended)  
- **npm** (or **yarn**)  
- **Vite** build tool (automatically used when you run the scripts)  

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
│  ├─ lib/               # API calls, utility functions, S3 url builder, etc.
│  ├─ store/             # Zustand store for auth state
│  ├─ types/             # TypeScript type definitions
│  ├─ App.tsx            # Main application routes
│  └─ main.tsx           # Entry point
├─ .env                  # Environment variables
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

2. **Open your browser** to see the site.  
   - If you have the backend running locally (default at **http://localhost:3000**), everything should connect automatically if your `.env` is set to point to it.

3. **Sign in / Sign up** with test credentials or create a new user. Once authenticated, you can:  
   - View and book appointments (including picking a date + time slot).  
   - Manage dependents.  
   - Update insurance information.  
   - **(If admin)** Access the Admin Dashboard to manage:
     - **Appointments** (view/cancel/reschedule all)
       - Includes a FullCalendar-based UI for scheduling
     - **Appointment Types** (CRUD)
     - **Users** (see all users, optionally promote them to admin)
     - **Dentists** (create, edit, delete, and **upload dentist photos**)

---

## Environment Variables

By default, the client looks for environment variables in an `.env` file at the root of the project. The two primary variables are:

- **`VITE_LOCAL_API_BASE_URL`** — e.g.,  
  ```bash
  VITE_LOCAL_API_BASE_URL=http://localhost:3000/api/v1
  ```
- **`VITE_PROD_API_BASE_URL`** — e.g.,  
  ```bash
  VITE_PROD_API_BASE_URL=https://dentist-appointment-backend.onrender.com/api/v1
  ```

> The app will detect if `import.meta.env.PROD` is `true` (i.e., production mode) and use `VITE_PROD_API_BASE_URL`. Otherwise, it defaults to `VITE_LOCAL_API_BASE_URL`.

If for any reason you don’t provide these variables, our code will **default** to `http://localhost:3000/api/v1`.

Example `.env`:

```
VITE_LOCAL_API_BASE_URL=http://localhost:3000/api/v1
VITE_PROD_API_BASE_URL=https://dentist-appointment-backend.onrender.com/api/v1
```

---

## Deployment

Typical steps to deploy a Vite-based React app:

1. **Set environment variables** (`VITE_LOCAL_API_BASE_URL` and/or `VITE_PROD_API_BASE_URL`) in your hosting environment or CI/CD build system.  
2. **Build** the production bundle:

   ```bash
   npm run build
   # or
   yarn build
   ```

   This will create a `dist` directory with static files.

3. **Deploy** those static files to a hosting provider (e.g., Netlify, Vercel, AWS S3, etc.).

Ensure that the environment variable used in production is set to the correct backend URL (`VITE_PROD_API_BASE_URL`) in your platform’s environment configuration.

---

## Key Features

1. **Appointments**  
   - Users can book new appointments, view upcoming ones, and cancel/reschedule if they meet the requirements (e.g., 24+ hours in advance).  
   - Admins can view and manage all appointments in a **FullCalendar**-based admin calendar (timeGrid or dayGrid view).  
   - The user booking process uses **react-day-picker** to choose the date, then a time slot picker to confirm the final appointment time.

2. **Dependents**  
   - Users can add/edit dependents.  
   - Manage appointments on behalf of your dependents.

3. **Insurance**  
   - Users can view/update their insurance info (provider name, policy number, plan type).

4. **Admin Dashboard**  
   - Available only to users with `role === 'admin'`.  
   - **Tabs** for:
     - **Appointments**: Admin sees all appointments site-wide, with the FullCalendar integration for quick drag-and-drop rescheduling.  
     - **Appointment Types**: Create/edit/delete appointment types (duration, name, description).  
     - **Users**: View all user accounts and optionally promote them to admin.  
     - **Calendar**: A more comprehensive calendar view for the entire schedule, including closed days.  
     - **Schedules**: Manage clinic open/close times, global closed days, and individual dentist unavailabilities.  
     - **Dentists**: Create/update/delete dentists. **Upload Dentist Photo** functionality is included (which references the AWS S3 URL stored in the backend).

5. **Role-based Access**  
   - Regular users can only manage their own profile/appointments.  
   - Admin sees and manages all appointments, appointment types, users, schedules, and more, including dentist profile images.

---

## AWS S3 Integration (Images)

When the backend is configured for **AWS S3** (and a dentist photo upload feature is used):

- Each **dentist** may have an `image_url` pointing to a publicly accessible S3 bucket key.  
- This front end simply renders `<img src={dentist.imageUrl} />`.  
- If you see an **“AccessDenied”** error, ensure your S3 bucket policy or ACL settings allow for `s3:GetObject` from the public.

Example Bucket Policy excerpt:
```jsonc
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```
Additionally:
- If your bucket enforces “Bucket Owner Enforced” ownership, the `public-read` ACL parameter might be ignored. Instead, rely on the bucket policy for public read access.
- Ensure “Block Public Access” is configured to allow `public` GET requests for objects (if you truly want them publicly viewable).

---

## Future Enhancements / Next Steps

- **Additional Form Validations**: Enhance error messages and validation logic for appointments or profile data.  
- **User Notifications**: Integrate real-time notifications (e.g., WebSockets or push notifications) for appointment changes.  
- **Accessibility**: Ensure best practices for screen readers and keyboard navigation.  
- **i18n**: Internationalization support for multiple languages.  
- **Theming**: Support multiple color schemes or branding.  
- **Better Admin Tools**: Precompute free slots for faster scheduling, advanced next-available-time searches, etc.  
- **Pagination**: Additional smooth or infinite scrolling pagination for large datasets (e.g., Admin user list).  
