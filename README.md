# LECATS: Lecturer's Class Attendance Tracking System

## 📖 Project Overview

LECATS is a full-stack web application designed to modernize and streamline the process of tracking lecturer attendance at an academic institution. This system replaces manual, paper-based methods with a secure, role-based digital platform, ensuring accurate and efficient record-keeping for administrative and academic management.

The application features distinct dashboards for different user roles, each tailored to their specific responsibilities within the academic workflow.

---

## ✨ Key Features

The system is built around four key user roles:

#### **Admin Dashboard**
The central control panel for the entire system.
* **User Management:** Create, update, and delete all user accounts (HODs, Lecturers, CRs).
* **Academic Structure Management:**
    * Create and manage **Departments** (e.g., School of Business).
    * Create and manage academic **Semesters**, including setting the single "Active" semester for the institution.
    * Create and manage **Programs** (e.g., Bachelor of IT, Diploma in Accounting) and assign them to departments.
    * Create and manage **Subjects** for each program.
* **Report Generation:** Generate detailed, downloadable PDF attendance reports based on department and custom date ranges.

#### **Head of Department (HOD) Dashboard**
The academic management hub for a specific department.
* **Timetable Management:** Create, view, and delete the weekly class schedule (timetable) for the active semester.
* **Resource Allocation:** Assign specific lecturers to subjects within their department.
* **Attendance Verification:** View and verify attendance records submitted by Class Representatives.
* View lecturer excuses for absences.

#### **Lecturer Dashboard**
A personalized portal for academic staff.
* **View Personal Timetable:** See their own weekly teaching schedule for the active semester.
* **Track Attendance History:** View a detailed history of their own attendance as recorded by CRs.
* **Submit Excuses:** For any recorded absence, a lecturer can submit an excuse with comments and a supporting PDF document within a 24-hour window.

#### **Class Representative (CR) Dashboard**
A simple, efficient tool for daily operations.
* **View Today's Schedule:** The dashboard automatically displays only the classes scheduled for the current day.
* **Submit Attendance:** Mark the lecturer for each class as "Present" or "Absent" with a single click.
* **Status Tracking:** The interface shows which classes have already had attendance submitted for the day.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, React Router, Axios, Bootstrap, React-Bootstrap
* **Backend:** Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
* **Database:** MySQL
* **PDF Generation:** FPDF2

---

## 🚀 Setup and Installation

To run this project locally, follow these steps:

### **1. Backend Setup**
```bash
# Navigate to the backend folder
cd backendL

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt

# Run the Flask server
python app.py

# Navigate to the frontend folder
cd frontendL

# Install the required packages
npm install

# Run the Vite development server
npm run dev
