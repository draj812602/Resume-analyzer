# Resume Analyzer Frontend

A React TypeScript application for analyzing resumes against job descriptions using AI.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root of the client directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get these values:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 2. Google OAuth Setup

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `http://localhost:5173` (for development)

### 3. Database Setup

Your database should already have these tables:

- `users` (for authentication)
- `resumes` (for storing user resumes)
- `job_descriptions` (for storing job descriptions)
- `tailoring_sessions` (for analysis results)

### 4. Start Development

```bash
npm install
npm run dev
```

The application will open at `http://localhost:5173`

## Features

- ✅ Google OAuth Authentication
- ✅ Resume Upload (PDF/DOCX support)
- ✅ Job Description Analysis
- ✅ AI-powered Resume Recommendations
- ✅ Skills Match Percentage
- ✅ Resume Export/Download
- ✅ Responsive Bootstrap UI

## Tech Stack

- React 18 + TypeScript
- Bootstrap 5 + React Bootstrap
- Supabase (Auth + Database)
- React Router v6
- Vite (Build tool)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Utility libraries
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```
