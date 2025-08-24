# Quiz App

A Next.js-based quiz application with admin and public interfaces, built with TypeScript, Tailwind CSS, and in-memory data storage.

## Features

### Admin Features (Authenticated)
- **Login**: Dummy authentication with hardcoded credentials
- **Quiz Management**: Create, edit, publish/unpublish quizzes
- **Question Management**: Add, edit, delete questions
- **Attempts Tracking**: View all quiz attempts with participant details
- **CSV Export**: Export quiz attempts to CSV format
- **Link Generation**: Generate unique quiz access links

### Public Features (No Login Required)
- **Quiz Access**: Access quizzes via unique token URLs
- **Form Validation**: React Hook Form with Zod validation
- **Single Submission**: Prevent multiple submissions per NIJ per quiz
- **Score Calculation**: Case-insensitive scoring system
- **Expiration Handling**: Automatic quiz expiration checking

## Demo Credentials

**Admin Login:**
- Email: `admin@example.com`
- Password: `password`

## Getting Started

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Use admin credentials to login and create quizzes

## Project Structure

```
├── src/app/
│   ├── admin/          # Admin dashboard pages
│   ├── q/[token]/      # Public quiz access
│   └── page.tsx        # Homepage
├── components/         # React components
├── lib/               # Utility functions and mock DB
├── types/             # TypeScript definitions
```

## Usage

1. **Admin**: Login → Create Quiz → Add Questions → Publish → Share Link
2. **Public**: Access shared link → Fill form → Submit → View score

Each NIJ can only submit once per quiz. All data is stored in memory.
