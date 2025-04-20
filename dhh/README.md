# DHH (De Horeca Helper)

DHH is a mobile-friendly web application that enables hospitality businesses to manage hygiene-related tasks digitally. The app replaces traditional paper-based systems with structured, category-based to-do tasks.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🏗 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📁 Project Structure

```
dhh/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   ├── services/         # Business logic and API calls
│   └── types/            # TypeScript type definitions
├── public/               # Static files
└── docs/                # Project documentation
```

## 🔐 Authentication Flow

1. Users are created by business admins (email + name)
2. Welcome email sent with login link
3. Authentication handled via Supabase
4. Protected routes require valid session

## 📚 Documentation

Detailed documentation can be found in the `/docs` directory:

- [Architecture Overview](docs/architecture.md)
- [Authentication](docs/authentication.md)
- [Database Schema](docs/database.md)
- [Task System](docs/tasks.md)
- [API Documentation](docs/api.md)

## 🔄 Development Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Submit PR for review
4. Merge to `main` after approval

## 📝 Environment Variables

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_REDIRECT=/dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
