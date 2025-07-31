# # LECATS - Lecturer Attendance System

A full-stack web application for managing lecturer attendance with React frontend and Spring Boot backend.

## Project Structure

```
lecats/
├── Frontend Files (React + Vite)
│   ├── index.html
│   ├── main.jsx
│   ├── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── components/
├── Backend Files (Spring Boot)
│   ├── pom.xml
│   ├── application.properties
│   ├── LecatsApplication.java
│   └── *.java (controllers, services, entities)
└── Startup Scripts
    ├── start-backend.sh
    ├── start-frontend.sh
    └── README.md
```

## Prerequisites

### Backend Requirements
- Java 17 or higher
- Maven 3.6+

### Frontend Requirements
- Node.js 16+ 
- npm 8+

## Quick Start

### Option 1: Manual Setup

1. **Start Backend (Terminal 1)**
   ```bash
   # Install dependencies and start Spring Boot
   ./start-backend.sh
   ```

2. **Start Frontend (Terminal 2)**
   ```bash
   # Install dependencies and start React dev server
   ./start-frontend.sh
   ```

### Option 2: Step by Step

#### Backend Setup
```bash
# Compile and run Spring Boot application
mvn clean compile
mvn spring-boot:run
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (empty)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course

## Features

- JWT-based authentication
- Role-based access control (Admin, HOD, Lecturer, CR)
- Department and course management
- User profile management
- Responsive React UI
- CORS-enabled API

## Configuration

### Backend Configuration (`application.properties`)
- Database: H2 in-memory (development)
- JWT secret and expiration
- CORS settings
- File upload settings

### Frontend Configuration (`vite.config.js`)
- Proxy configuration for API calls
- Development server settings

## Default User Roles

The application supports the following roles:
- **admin** - Full system access
- **hod** - Head of Department access
- **lecturer** - Lecturer access
- **cr** - Class Representative access

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend (8080): `lsof -ti:8080 | xargs kill -9`
   - Frontend (5173): `lsof -ti:5173 | xargs kill -9`

2. **CORS Issues**
   - Ensure backend is running on port 8080
   - Check CORS configuration in `SecurityConfig.java`

3. **Database Issues**
   - Access H2 console at http://localhost:8080/h2-console
   - Database recreated on each restart (development mode)

4. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT secret configuration

## Development

### Adding New Features
1. Backend: Create controller, service, repository, entity
2. Frontend: Create component, add routing
3. Update API service calls
4. Test authentication and authorization

### Environment Variables
Create `.env` file for production:
```
DB_URL=your_production_database_url
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_strong_jwt_secret
```-