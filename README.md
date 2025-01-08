# ISA Dental Frontend

This project is a **React + TypeScript + Vite** front-end for the **ISA Dental** appointment scheduling system. It provides a user-friendly interface for patients (and their dependents) to manage appointments, update insurance info, receive email invitations to finish setting up their accounts, and communicate with the ISA Dental backend. It also integrates with AWS S3 if you’re displaying dentist images that have been uploaded from the backend.

---

## Table of Contents

1. [Requirements](#requirements)  
2. [Installation and Setup](#installation-and-setup)  
3. [Project Structure](#project-structure)  
4. [Running Locally](#running-locally)  
5. [Environment Variables](#environment-variables)  
6. [Deployment](#deployment)  
7. [Key Features](#key-features)  
8. [Invitations and Finish-Invitation Flow](#invitations-and-finish-invitation-flow)
9. [Updated Admin Dashboard](#updated-admin-dashboard)
10. [AWS S3 Integration (Images)](#aws-s3-integration-images)
11. [Future Enhancements / Next Steps](#future-enhancements--next-steps)

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
│  ├─ pages/             # Page-level components (e.g., /login, /appointments, /admin)
│  ├─ hooks/             # Custom React hooks (e.g., useAuth, useInsurance)
│  ├─ lib/               # API calls, utilities, S3 url builder, etc.
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
   - **(If admin)** Access the Admin Dashboard (see [Updated Admin Dashboard](#updated-admin-dashboard)).

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

2. **Dependents**  
   - Users can add/edit dependents.  
   - Manage appointments on behalf of your dependents.

3. **Insurance**  
   - Users can view/update their insurance info (provider name, policy number, plan type).

4. **Role-based Access**  
   - Regular users can only manage their own profile/appointments.  
   - Admin sees and manages all appointments, appointment types, users, schedules, and more, including dentist profile images.

5. **Invitation Flow**  
   - Admin can invite new users by creating them with an email (no password).  
   - The new user receives an email with a link to finish their invitation and create their password.  
   - This flow integrates seamlessly into the login process once the user sets their password.

---

## Invitations and Finish-Invitation Flow

We now support an **invitation-based** sign-up for admin-created users:

1. **Admin** creates a user (with `email`, `firstName`, `lastName`) in the **Admin Dashboard**.  
2. The newly created user receives an **email invitation** (powered by SendGrid or your chosen email service).  
3. The user clicks the **invitation link** (`/finish-invitation?token=...`) and is taken to the **FinishInvitation** page.  
4. The user enters their **new password**, which finalizes the setup.  
5. The user is then automatically logged in and can see their profile or appointments.

---

## Updated Admin Dashboard

Our Admin Dashboard has been **restyled** with a cleaner, more modern layout. It features:

- A **tab-based** interface with distinct panels for:
  - **Appointments** (displayed in a card-like layout, filterable by date/dentist/status).
  - **Appointment Types** (CRUD).
  - **Users** (searchable list, create new invitations, promote to admin).
  - **Calendar** (FullCalendar for a dayGrid or timeGrid view).
  - **Schedules** (manage clinic open/close times, closed days, dentist unavailabilities).
  - **Dentists** (card-based layout with image upload functionality).  

We have also optimized for **mobile view** by making the tabs and calendar more responsive, so the interface does not overflow horizontally. The appointment cards and user lists use a more “card-like” approach on mobile to reduce visual clutter.

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
- **Better Admin Tools**: More advanced search, precomputed free slots, expanded reporting on appointment usage, etc.  
- **Improved Invitation Management**: Option for admins to resend or invalidate invitations.
