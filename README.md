# StudyTrack

StudyTrack is a polished friend-based study planner built with:

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Authentication & data: Firebase Authentication + Firestore
- Hosting: Vercel

## Quick start

```bash
cd frontend
npm install
npm run dev
```

## Firebase setup

Create a Firebase project and add these environment variables to a frontend `.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Then enable:

- Google sign-in in Firebase Authentication
- Firestore Database

## Vercel deployment

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Set the Firebase environment variables in Vercel Project Settings.
4. Deploy.

## Features covered

- Google login
- Shared study dashboard
- Study task creation and status updates
- Study groups
- Calendar placeholder page
- Real-time updates through Firestore
- Demo-mode fallback for local use before Firebase is configured
