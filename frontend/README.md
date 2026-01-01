# Flixr Community Web

A Next.js frontend application for the Flixr Community API. Browse movies, read reviews, and engage with the community.

## Setup

1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

2. Create `.env.local` from `.env.example`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Update `.env.local` with your API URL:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`

## Running the Development Server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Architecture

### Authentication
- Uses Redux Toolkit for global state management
- Auth tokens are persisted to localStorage to survive page refreshes
- **Production note**: For production, use httpOnly cookies instead of localStorage for better security

### API Communication
- Axios is used for all API requests via `src/lib/api.ts`
- Authorization headers are automatically attached via interceptors when a token is available
- Uses `NEXT_PUBLIC_API_URL` environment variable for the backend URL

### Data Fetching
- Server components fetch initial data (home, search, movie details)
- Client components use the Axios client for interactive features (reviews, comments)
- No additional dependencies like React Query are required for basic caching

## Project Structure

\`\`\`
/app
  /auth
    /login/page.tsx
    /register/page.tsx
  /movie/[id]/page.tsx
  /search/page.tsx
  /profile/page.tsx
  page.tsx
  layout.tsx

/src
  /components
    Header.tsx
    MovieCard.tsx
    MovieGrid.tsx
    ReviewComposer.tsx
    Comments.tsx
  /lib
    api.ts
  /store
    index.ts
    slices/authSlice.ts
\`\`\`

## Building for Production

\`\`\`bash
pnpm build
pnpm start
