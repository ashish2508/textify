# Textify — Real-time Multilingual Chat

A 1-to-1 real-time multilingual chat application with neo-brutalism UI. Send messages in your language, and the receiver sees them translated to their preferred language.

## Tech Stack

- **Next.js** (App Router + API Routes)
- **Prisma** + **Neon** (PostgreSQL)
- **Pusher** (Real-time messaging)
- **Google Translate API** (Translation)
- **NextAuth.js v5** (Authentication with OTP)
- **Tailwind CSS** (Neo-brutalism styling)

## Features

- Email/password registration with unique email enforcement
- OTP-based login verification (3 attempts, then account lock)
- 1-to-1 real-time chat via Pusher
- Automatic translation of received messages
- Translation caching for performance
- User-selectable message language
- Preferred language settings per user

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

You'll need:
- **Neon** database URL
- **Pusher** app credentials
- **SMTP** credentials (for OTP emails)
- **Google Translate** API key

### 3. Set up database

```bash
npx prisma db push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register, OTP verification
│   ├── (main)/          # Chat list, Chat room, Settings
│   ├── api/
│   │   ├── auth/        # NextAuth, Register, OTP endpoints
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── settings/
│   │   └── translate/
│   └── page.tsx         # Root redirect
├── components/
│   ├── chat/
│   └── ui/              # Neo-brutalism components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── email.ts         # OTP email sending
│   ├── prisma.ts        # Prisma client singleton
│   ├── pusher.ts        # Pusher server/client
│   └── translate.ts     # Google Translate wrapper
└── middleware.ts        # Auth protection
```

## Deployment

- **Frontend**: Deploy to Vercel
- **Database**: Neon (PostgreSQL)
- No separate backend required
