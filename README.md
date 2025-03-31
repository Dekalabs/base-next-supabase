# Next.js Scaffold with Supabase Auth and Internationalization

A modern, production-ready scaffold for Next.js applications featuring authentication, internationalization, and UI components out of the box.

## Features

- **Next.js 15+** - Latest version with App Router
- **TypeScript** - Type safety and better developer experience
- **Authentication** - Complete auth system using Supabase
  - Login/Register flows
  - Password recovery
  - Email verification
  - Protected routes
- **Internationalization** - Built-in support for multiple languages using next-intl
  - English and Spanish included
  - Easy to add more languages
  - URL-based locale switching
- **UI Components**
  - Modern UI using Tailwind CSS and DaisyUI
  - Responsive design
  - Dark/Light theme support
- **Best Practices**
  - Server and Client Components separation
  - Type-safe API routes
  - Environment variables configuration
  - Production-ready folder structure

## Getting Started

1. Clone this repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Set up your environment variables
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── auth/          # Authentication pages
│   │   ├── components/    # Shared components
│   │   ├── platform/     # Protected routes
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   └── lib/              # Shared utilities
├── messages/             # Translation files
│   ├── en.json
│   └── es.json
├── public/              # Static assets
└── middleware.ts        # Auth & i18n middleware
```

## Authentication

The scaffold includes a complete authentication system using Supabase:
- Email/Password authentication
- Password recovery flow
- Email verification
- Protected routes
- Session management

## Internationalization

Built-in support for multiple languages using next-intl:
- URL-based locale routing (/en/about, /es/about)
- Easy to add new languages
- Type-safe translations
- Automatic locale detection

## UI Components

The scaffold uses Tailwind CSS and DaisyUI for styling:
- Modern and responsive design
- Light/Dark theme support
- Pre-built components
- Easy to customize

## Development

### Adding New Languages

1. Add your locale to next-intl.config.js
2. Create a new translation file in messages/
3. Add translations following the existing structure

### Protected Routes

To create a protected route:
1. Place it under the app/[locale]/platform/ directory
2. The auth middleware will automatically protect these routes

### Environment Variables

Required environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
