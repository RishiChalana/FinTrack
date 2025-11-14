# FinTrack - Complete Project Summary

## 🎯 Project Overview
**FinTrack** is a comprehensive personal finance management web application built with Next.js 15, TypeScript, Prisma, and MySQL. It provides users with tools to track income, expenses, budgets, and financial goals with an AI-powered assistant.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Password Hashing**: bcryptjs
- **PDF Generation**: jsPDF
- **CSV Export**: json2csv

### AI Integration
- **Framework**: Google Genkit
- **AI Models**: Google Generative AI
- **Features**: Natural language financial queries and assistance

---

## 📊 Database Schema (Prisma)

### Core Models

1. **User**
   - Authentication (email, password hash)
   - Role-based access (USER/ADMIN)
   - Optional 2FA support
   - Relationships: accounts, transactions, budgets, goals, categories, notifications

2. **Account**
   - Types: CASH, BANK, CREDIT_CARD, INVESTMENT, OTHER
   - Multi-currency support (ISO currency codes)
   - Starting balance tracking
   - Customizable color and icon

3. **Transaction**
   - Types: INCOME, EXPENSE, TRANSFER
   - Decimal precision (18, 2) for amounts
   - Links to account and category
   - Optional transfer between accounts
   - Payment method tracking
   - Notes/merchant information
   - Receipt URL support

4. **Category**
   - Types: INCOME, EXPENSE
   - User-customizable categories
   - Color and icon customization

5. **Budget**
   - Periods: MONTHLY, WEEKLY, CUSTOM
   - Optional category linking
   - Custom date ranges
   - Multi-currency support

6. **Goal** (Schema exists but feature removed from UI)
   - Target amount tracking
   - Current progress
   - Target date

7. **Notification**
   - User notifications
   - Read/unread status

---

## 🚀 Core Features

### 1. Authentication & Authorization
- **Registration**: Email, password, name
- **Login**: JWT-based authentication
- **Token Management**: Access tokens (15min) + refresh tokens (7 days)
- **Auto-refresh**: Automatic token refresh on 401 errors
- **Password Recovery**: Forgot password functionality
- **Session Management**: Secure token storage in localStorage

### 2. Dashboard
**Location**: `/dashboard`

**Components**:
- **Balance Cards**: 
  - Total Balance (Income - Expenses)
  - Total Income (green)
  - Total Expenses (red)
  - Auto-refreshes on data updates

- **Recent Transactions**:
  - Last 5 transactions
  - Shows merchant, category, amount, date
  - **CSV Import Feature**:
    - Upload bank statement CSV files
    - Auto-detects credit/debit columns
    - Supports CR/DR indicators
    - Maps merchant names to transactions
    - Auto-uploads on file selection
    - Updates dashboard immediately

- **Budget Status**:
  - Progress bars for each budget
  - Shows spent vs. allocated amount
  - Matches transactions by merchant name or category
  - Real-time updates

- **Spending Overview Chart**:
  - Circular pie chart of expenses by category
  - Interactive hover tooltips
  - Shows category name, amount, percentage
  - Center displays total expenses
  - Auto-refreshes on data changes

### 3. Transactions Management
**Location**: `/transactions`

**Features**:
- **Add Transactions**:
  - Type: Income or Expense
  - Amount, currency, payment method
  - Notes/merchant name
  - Date/time selection
  - Auto-creates default account if none exists

- **View Transactions**:
  - List all transactions
  - Shows type, method, currency, amount
  - Sorted by date (newest first)

- **Delete Transactions**:
  - Remove individual transactions

- **CSV Import** (from Dashboard):
  - Supports multiple CSV formats
  - Detects delimiter (comma/semicolon)
  - Handles BOM characters
  - Supports parentheses for negative amounts
  - Maps credit/debit to income/expense
  - Recognizes merchant/payee columns
  - Category mapping by name
  - Account matching

### 4. Budgets Management
**Location**: `/budgets`

**Features**:
- **Create Budgets**:
  - Name, amount, period (Monthly/Weekly/Custom)
  - Currency selection
  - Optional category linking

- **View Budgets**:
  - List all budgets with details
  - Shows period, currency, amount

- **Delete Budgets**:
  - Remove budgets

- **Budget Tracking**:
  - Dashboard shows progress
  - Matches expenses by merchant name or category
  - Real-time spending updates

### 5. Accounts Management
**Location**: `/accounts` (redirects to dashboard)

**API Endpoints Available**:
- GET `/api/accounts` - List all accounts
- POST `/api/accounts` - Create account
- GET `/api/accounts/[id]` - Get account details
- PUT `/api/accounts/[id]` - Update account
- DELETE `/api/accounts/[id]` - Delete account

**Account Types**:
- Cash
- Bank Account
- Credit Card
- Investment
- Other

### 6. Reports & Export
**Location**: `/reports`

**Features**:
- **Date Range Selection**:
  - Start date picker
  - End date picker
  - Inclusive date filtering (00:00:00 to 23:59:59.999)

- **CSV Export**:
  - Includes: ID, date, type, amount, currency, account, category, merchant, method
  - UTF-8 BOM for Excel compatibility
  - Filters by date range

- **PDF Export**:
  - Formatted financial report
  - Shows date range in header
  - Lists all transactions in range
  - Pagination for large reports
  - Includes transaction details

**Date Filtering**:
- Properly handles timezone issues
- Uses MySQL DATETIME comparison
- Inclusive range (start to end of day)

### 7. AI Financial Assistant
**Location**: `/ai-assistant`

**Features**:
- **Natural Language Queries**:
  - "Show my expenses this month"
  - "How much did I spend on [category]?"
  - "What are my budgets?"
  - "Create budget for [name]"
  - "Monthly spending summary"
  - "How much did I save?"
  - "Export report as PDF"

- **Intent Recognition**:
  - Category spending queries
  - Budget creation
  - Savings calculation
  - Transaction summaries
  - Report generation

- **AI Integration**:
  - Google Genkit framework
  - Falls back to LLM for complex queries
  - Context-aware responses

### 8. User Profile
**Location**: `/profile`

**Features**:
- View user information
- Update profile details

### 9. Admin Panel
**Location**: `/admin`

**Features**:
- Admin-only access
- User management capabilities

---

## 🔐 Security Features

1. **Authentication**:
   - JWT-based authentication
   - Secure password hashing (bcrypt)
   - Token refresh mechanism
   - Session expiration handling

2. **Authorization**:
   - User-scoped data access
   - Role-based access control (USER/ADMIN)
   - API route protection via `requireAuth`

3. **Data Protection**:
   - All queries filtered by userId
   - No cross-user data access
   - Secure token storage

---

## 🎨 UI/UX Features

1. **Theme Support**:
   - Dark/Light mode toggle
   - Theme persistence

2. **Responsive Design**:
   - Mobile-friendly layout
   - Adaptive grid systems
   - Responsive charts

3. **Component Library**:
   - shadcn/ui components
   - Consistent design system
   - Accessible components

4. **User Navigation**:
   - Sidebar navigation
   - User avatar with initials
   - Dropdown menu
   - Real-time user info display

5. **Toast Notifications**:
   - Success/error feedback
   - Import status updates
   - User-friendly messages

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot` - Password recovery

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `POST /api/transactions/import` - Import CSV file

### Accounts
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/[id]` - Get account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### Reports
- `GET /api/reports/export?type=csv&start=YYYY-MM-DD&end=YYYY-MM-DD` - Export CSV
- `GET /api/reports/export?type=pdf&start=YYYY-MM-DD&end=YYYY-MM-DD` - Export PDF

### AI Assistant
- `POST /api/assistant` - AI financial queries

### User
- `GET /api/me` - Get current user info

---

## 🔄 Data Flow & State Management

1. **Client-Side State**:
   - React hooks (useState, useEffect)
   - Local component state
   - localStorage for tokens

2. **Data Synchronization**:
   - Custom `data-updated` event system
   - Components listen for updates
   - Auto-refresh on imports/changes

3. **API Client**:
   - Centralized API functions
   - Automatic token injection
   - Auto-refresh on 401 errors
   - Error handling

---

## 📦 Key Libraries & Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### Database
- `@prisma/client` - ORM client
- `prisma` - Database toolkit

### Authentication
- `jsonwebtoken` - JWT handling
- `bcryptjs` - Password hashing

### UI Components
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `recharts` - Charts

### Forms & Validation
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Form resolvers

### Utilities
- `date-fns` - Date manipulation
- `clsx` - Class name utilities
- `tailwind-merge` - Tailwind class merging

### Export
- `jspdf` - PDF generation
- `json2csv` - CSV conversion

### AI
- `genkit` - AI framework
- `@genkit-ai/google-genai` - Google AI integration

---

## 🎯 Recent Enhancements

1. **CSV Import**:
   - Smart credit/debit detection
   - Multiple format support
   - Merchant name extraction
   - Category mapping

2. **Dashboard Improvements**:
   - Real-time updates
   - Better data visualization
   - Improved budget tracking

3. **Report Generation**:
   - Fixed date filtering
   - Better error handling
   - Improved PDF formatting

4. **User Experience**:
   - Auto-upload on file selection
   - Toast notifications
   - Better error messages
   - User info display

---

## 🗂️ Project Structure

```
FinTrack/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (app)/             # Protected routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── transactions/  # Transaction management
│   │   │   ├── budgets/       # Budget management
│   │   │   ├── reports/       # Report generation
│   │   │   └── ai-assistant/   # AI chat
│   │   ├── api/               # API routes
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── profile/           # User profile
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── ai/                # AI components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth utilities
│   │   ├── api-auth.ts        # API auth middleware
│   │   └── api-client.ts      # API client utilities
│   └── ai/
│       └── flows/             # AI flows
└── package.json
```

---

## 🚦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Environment Variables**:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - JWT signing secret
   - `JWT_EXPIRES_IN` - Access token expiry (default: 15m)
   - `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📝 Notes

- Goals feature exists in schema but removed from UI
- Accounts page redirects to dashboard
- Root route redirects to login
- All data is user-scoped for security
- Supports multi-currency transactions
- CSV import handles various bank statement formats

---

## 🔮 Future Enhancements (Potential)

- Goal tracking UI (schema ready)
- Receipt upload and OCR
- Recurring transactions
- Financial insights and trends
- Mobile app
- Multi-user household support
- Investment tracking
- Bill reminders
- Category-based spending limits

---

**Last Updated**: Based on current codebase state
**Version**: 0.1.0
**Status**: Active Development

