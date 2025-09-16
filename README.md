# Multi-Tenant SaaS Notes Application

A full-stack notes management application built for multiple organizations with subscription-based features and role-based access control.

## Overview

This project implements a multi-tenant SaaS application where different companies (tenants) can manage their notes independently. Each tenant has their own users with different permission levels, and subscription plans that control feature access.

## Multi-Tenancy Design

I chose a **shared database with tenant isolation** approach for this application. Here's why:

- All tenants share the same database and application instance
- Every table includes a `tenant_id` column to separate data
- Database queries automatically filter by tenant context
- More cost-effective than separate databases per tenant
- Easier to maintain and deploy updates across all tenants

The trade-off is slightly more complex query logic, but the benefits in terms of operational simplicity and cost made this the right choice.

## Getting Started

### Backend Setup
```bash
cd saas-notes-backend
pip install -r requirements.txt
python main.py
```

The API will start on `http://localhost:8000`

### Frontend Setup  
```bash
cd saas-notes-frontend
npm install
npm run dev
```

The web app will start on `http://localhost:3000`

## Test Accounts

I've pre-configured these accounts for testing (password is `password` for all):

**Acme Corporation:**
- admin@acme.test - Admin user
- user@acme.test - Regular member

**Globex Corporation:**
- admin@globex.test - Admin user  
- user@globex.test - Regular member

## Features

### User Roles
**Admin users can:**
- Create, edit and delete notes
- Invite new users to their organization
- Upgrade subscription plans

**Member users can:**
- Create, edit and delete notes
- Cannot access admin features

### Subscription Plans
**Free Plan:**
- Limited to 3 notes maximum
- Basic note management features

**Pro Plan:**
- Unlimited notes
- All features included

Admins can upgrade their organization instantly through the web interface.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password

### Notes
- `GET /notes` - List notes for current user's tenant
- `POST /notes` - Create new note  
- `GET /notes/{id}` - Get specific note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

### Admin Features
- `POST /users` - Invite new user (admin only)
- `POST /tenants/{slug}/upgrade` - Upgrade subscription (admin only)

### System
- `GET /health` - Health check endpoint

Full API documentation available at `http://localhost:8000/docs`

## Architecture Decisions

### Backend (FastAPI)
- FastAPI for the REST API with automatic OpenAPI documentation
- SQLAlchemy ORM for database operations
- PostgreSQL for production data storage
- JWT tokens for stateless authentication
- Bcrypt for password hashing

### Frontend (Next.js)
- Next.js 14 with TypeScript for type safety
- Tailwind CSS for responsive styling  
- Custom React hooks for state management
- Client-side routing with protected routes

### Database Schema
```
tenants: id, slug, name, subscription_plan, timestamps
users: id, tenant_id, email, password_hash, role, timestamps  
notes: id, tenant_id, user_id, title, content, timestamps
```

## Security Implementation

### Multi-Tenant Isolation
- All database queries include tenant_id filtering
- JWT tokens carry tenant context
- API middleware validates tenant access
- No cross-tenant data access possible

### Authentication & Authorization
- Bcrypt password hashing with salt
- JWT tokens with expiration
- Role-based route protection
- CORS configured for cross-origin requests

## Development Workflow

### Database Migrations
The application automatically creates tables and seeds initial data on startup.

### Environment Variables
Create `.env` file in backend:
```
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_jwt_secret_key
```

Create `.env.local` file in frontend:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Manual Testing
1. Start both backend and frontend servers
2. Login with any of the test accounts
3. Try creating notes, inviting users (as admin), upgrading plans
4. Verify tenant isolation by switching between different accounts

### API Testing
Use the interactive documentation at `http://localhost:8000/docs` to test endpoints directly.

## Deployment Considerations

Both backend and frontend are configured for deployment on Vercel:
- Backend uses serverless functions
- Frontend uses static generation where possible
- Environment variables configured through Vercel dashboard
- CORS headers configured for production domains

## Known Limitations

- Currently supports only email/password authentication
- Subscription upgrades are one-way (no downgrades implemented)
- No real payment processing (upgrade is just a button click)
- Basic user management (no password reset flow)

## Future Improvements

- Implement proper payment processing with Stripe
- Add email verification for new users  
- Build user profile management
- Add note sharing between users within same tenant
- Implement note categories and search functionality

This project demonstrates core SaaS patterns including multi-tenancy, role-based access control, and subscription management in a clean, scalable architecture.