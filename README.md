# 🚀 Prodify CRM

A comprehensive, full-stack Customer Relationship Management (CRM) system built with React and Node.js/Express. Manage your customers, products, orders, and analytics all in one powerful platform.

![Prodify CRM](asset/img/Home_Page.png)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Seeding Data](#-seeding-data)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

### Core Functionality
- **👤 User Authentication & RBAC** - Secure JWT-based authentication with granular Role-Based Access Control (CEO, Sales, Manager, Support, Admin)
- **👥 Customer Management** - Complete CRUD operations for customer information, contact details, and status tracking
- **📄 Document Management (New)** - Integrated system to handle file uploads (PDF, Images, Word) for customers, deals, and contracts with in-browser preview
- **🤝 Contracts Module (New)** - Dedicated tracking for business agreements, linked to customers and sales pipeline
- **📊 Sales Pipeline** - Drag-and-drop Kanban board for managing deals across different stages
- **📈 Analytics & Reporting** - Interactive charts and dashboards for data-driven insights
- **🔐 Admin Panel** - Administrative controls, user management, and system-wide settings

### Additional Features
- **🎯 Lead Management** - Track, score, and convert leads to customers
- **✅ Task Management** - Daily workflow tracking with list and calendar views
- **🕒 Contact Timeline** - Centralized activity logging and interaction history
- **💵 Invoice & Billing** - Generate PDF invoices and track payment statuses
- **🎯 Customer Segmentation** - Tag-based segmentation and revenue analysis
- **📈 Advanced Reports & Exports** - Export data to CSV and view detailed analytics charts
- **🎫 Support Tickets** - Customer case management with conversation threads
- **📧 Email Integration** - Manage templates and simulate email campaigns
- **📝 Notes & Notifications** - Internal communication and activity tracking
- **💬 Messages** - Customer communication history and management
- **⚙️ Settings** - Customizable system preferences and profile management

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15 (App Dir)** | Modern React framework with server/client components |
| **Dnd-kit** | Modular drag-and-drop toolkit for the Sales Pipeline |
| **React Icons** | Icon library for a modern, sleek interface |
| **Axios** | HTTP client for reliable API communication |
| **Chart.js** | Visual data representation for analytics |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js & Express.js** | Robust server-side framework |
| **MongoDB & Mongoose** | NoSQL database with structured schema modeling |
| **Multer** | Middleware for handling multipart/form-data for file uploads |
| **JWT** | Secure token-based authentication and role enforcement |

---

## 📁 Project Structure (Detailed)

```text
.
  |docker-compose.keycloak.yml
  |README.md
  |frontend/
  |  |next.config.ts
  |  |package.json
  |  |src/
  |  |  |app/
  |  |  |  |reports/page.tsx
  |  |  |  |notifications/page.tsx
  |  |  |  |admin/page.tsx
  |  |  |  |tickets/page.tsx
  |  |  |  |analytics/page.tsx
  |  |  |  |tasks/page.tsx
  |  |  |  |settings/page.tsx
  |  |  |  |tenders/page.tsx
  |  |  |  |dashboard/
  |  |  |  |  |manager/
  |  |  |  |  |ceo/
  |  |  |  |  |sales/
  |  |  |  |  |support/
  |  |  |  |contracts/page.tsx
  |  |  |  |pipeline/page.tsx
  |  |  |  |customers/page.tsx
  |  |  |  |...
  |  |  |features/
  |  |  |  |admin/components/AdminPanel.tsx
  |  |  |  |analytics/components/AnalyticsDashboard.tsx
  |  |  |  |auth/components/ProtectedRoute.tsx
  |  |  |  |contracts/components/ContractManagement.tsx
  |  |  |  |customers/components/CustomerManagement.tsx
  |  |  |  |documents/components/DocumentManager.tsx
  |  |  |  |pipeline/components/PipelineManagement.tsx
  |  |  |  |tasks/components/TasksManagement.tsx
  |  |  |  |...
  |  |  |shared/
  |  |  |  |components/Sidebar.tsx
  |  |  |  |components/Navbar.tsx
  |  |  |  |...
  |backend/
  |  |server.js
  |  |seedAdmin.js
  |  |models/
  |  |  |User.js
  |  |  |Document.js
  |  |  |Contract.js
  |  |  |Customer.js
  |  |  |Deal.js
  |  |  |...
  |  |routes/
  |  |  |auth.js
  |  |  |customers.js
  |  |  |deals.js
  |  |  |documents.js
  |  |  |contracts.js
  |  |  |...
  |  |middleware/
  |  |  |auth.js
  |  |  |roleAuth.js
  |  |uploads/
  |  |  |documents/
  |  |  |products/
  |  |  |avatars/
```

---

## 📸 Screenshots

### Contracts & Document Management
![Contracts Management](asset/img/Contracts_Page.png)
*Track agreements and manage their associated documents in a centralized view.*

### Customer Profile / Deal Details
![Document Integration](asset/img/Document_Upload.png)
*Upload reports, proposals, and customer IDs directly within contextual modals.*

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | v16 or higher | JavaScript runtime |
| **MongoDB** | v4.4 or higher | Database server |
| **npm** | v7 or higher | Package manager |
| **Git** | Latest | Version control |

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd prodify-crm
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/crm

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Admin User Configuration (optional)
INITIAL_ADMIN_EMAIL=admin@prodify.com
INITIAL_ADMIN_PASSWORD=admin123
INITIAL_ADMIN_NAME=System Administrator

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## 🌱 Seeding Data

The project includes seed scripts to populate the database with sample data for testing and development.

### Seeding Data (Important!)

**Admin User**

### Seed Admin User

Creates the initial admin account for system access:

```bash
cd backend
node seedAdmin.js
```

**Default Credentials:**
- Email: `admin@prodify.com`
- Password: `admin123`

> ⚠️ **Security Note:** Change the admin password after first login!

## 🚀 Running the Application

### Development Mode

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

#### Start the Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Mode

#### Build the Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

#### Start the Backend

```bash
cd backend
npm start
```

The application will be available at `http://localhost:5000`

### Verify Installation

1. Open `http://localhost:5173` in your browser
2. Log in with admin credentials:
   - Email: `admin@prodify.com`
   - Password: `admin123`
3. Explore the dashboard and various features

---

## 📡 API Documentation

### Document Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload a new file (Max 5MB) |
| GET | `/api/documents/:relatedId` | Get all documents for a specific entity |
| DELETE | `/api/documents/:id` | Delete a document |

### Contract Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracts` | List all contracts |
| POST | `/api/contracts` | Create a new contract |
| GET | `/api/contracts/:id` | Get contract details |
| PUT | `/api/contracts/:id` | Update contract status/info |

---

## 🔐 Credentials & Roles

The system uses a granular RBAC system. You can test these default users with the password **`password123`**:

- **CEO**: `ceo@prodify.com`
- **Sales Rep**: `sales@prodify.com`
- **Manager**: `manager@prodify.com`
- **Support**: `support@prodify.com`
- **Admin**: `admin@prodify.com` (Bypasses all role checks)

---

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/) - Robust database solution
- [React](https://reactjs.org/) - Excellent frontend framework
- [Express.js](https://expressjs.com/) - Minimal and flexible web framework
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [All Contributors](https://github.com/prodify/crm/graphs/contributors) - Thanks for your contributions!

---

**Built with ❤️ by the Prodify Development Team**

Happy CRM Management! 🎉
