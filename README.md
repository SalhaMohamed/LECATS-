# LECATS: Lecturer's Class Attendance Tracking System

## 📖 Project Overview

LECATS is a full-stack web application designed to modernize and streamline the process of tracking lecturer attendance at an academic institution. This system replaces manual, paper-based methods with a secure, role-based digital platform, ensuring accurate and efficient record-keeping for administrative and academic management.

The application features distinct dashboards for different user roles, each tailored to their specific responsibilities within the academic workflow.

---

## ✨ Key Features

LECATS is built around four key user roles, each with a tailored dashboard.

#### **Admin Dashboard**
The central control panel for the entire system.
* **Full System Management:** Complete CRUD (Create, Read, Update, Delete) control over all academic data, including Departments, Semesters, Programs, and Subjects.
* **User Management:** Create and manage accounts for HODs, Lecturers, and CRs.
* **Comprehensive Reporting:** Generate detailed attendance reports by department and date range, with on-screen previews and statistical highlights.
* **CSV Export:** Download full reports in CSV format for easy analysis in spreadsheet software like Excel.

#### **Head of Department (HOD) Dashboard**
The academic management hub for a specific department.
* **Timetable Management:** Create and manage weekly recurring timetables for the active semester.
* **Special Scheduling:** Schedule special, one-time classes for any lecturer and target them to any department's CR.
* **Attendance Verification:** Review and verify all attendance records submitted by CRs.

#### **Lecturer Dashboard**
A personalized portal for academic staff.
* **Schedule Viewing:** View a complete weekly schedule and a list of upcoming special classes.
* **Attendance History:** Review a detailed history of all recorded attendance.
* **Excuse Submission:** Securely upload a PDF file and a comment as an excuse for a recorded absence.

#### **Class Representative (CR) Dashboard**
A simple, efficient tool for daily operations.
* **Daily View:** See a simple, live list of all scheduled classes (both regular and special) for the current day.
* **Attendance Submission:** Mark lecturers as 'Present' or 'Absent' with a single click.

#### **General Features**
* **Secure Authentication:** Role-based authentication using JSON Web Tokens (JWT).
* **Modern UI/UX:** A responsive single-page landing page with a modern design, including a Dark Mode toggle and "Glassmorphism" effects.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, React Router, Axios, Bootstrap, React-Bootstrap
* **Backend:** Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
* **Database:** MySQL

---

## 🚀 Setup and Installation

To run this project locally, follow these steps:

### **1. Backend Setup**
```bash
# Navigate to the backend folder
cd backendL

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required packages
pip install -r requirements.txt

# Run the Flask server
python run.py


# Navigate to the frontend folder
cd frontendL

# Install the required packages
npm install

# Run the Vite development server
npm run dev

# Run the Flask server
python run.py
