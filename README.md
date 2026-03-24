# 🏥 MediCare Pro

> **Industry-Level Hospital Management & Telemedicine Platform** — Built with MERN Stack

![MERN](https://img.shields.io/badge/MERN-Stack-1565c0?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000?style=flat-square)
![Razorpay](https://img.shields.io/badge/Payment-Razorpay-0a2540?style=flat-square)

---

## 🌟 Features

### 👨‍⚕️ Doctor Portal
- Manage daily appointments (confirm / complete / cancel)
- Video telemedicine link auto-generated
- Write digital prescriptions with medicines & lab tests
- View patient history & medical records
- Manage availability slots & schedule
- Rating & review system

### 🧑‍💼 Patient Portal
- Search & filter doctors by specialization, fees, rating
- Book in-person or telemedicine appointments
- Slot-based time booking system
- Pay consultation fees via Razorpay
- Download digital prescriptions
- View complete medical history

### 🏥 Admin Panel
- Dashboard with revenue analytics
- Approve / reject doctor registrations
- Activate / deactivate user accounts
- View all appointments system-wide
- Revenue tracking & payment reports

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, React Router v6, Context API, Recharts |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT + bcrypt (12 rounds) |
| Payment | Razorpay Integration |
| Email | Nodemailer (Gmail SMTP) |
| Telemedicine | Jit.si Video Call Links |

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/medicare-pro.git
cd medicare-pro
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Setup Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT Secret, Razorpay keys
```

### 4. Run Development Server
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### 5. Demo Accounts (seed first)
| Role | Email | Password |
|------|-------|----------|
| Patient | patient@demo.com | demo123 |
| Doctor | doctor@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## 📁 Project Structure

```
medicare-pro/
├── backend/
│   ├── models/
│   │   ├── User.js           # 3 roles: patient/doctor/admin
│   │   ├── Doctor.js         # Doctor profile, slots, fees
│   │   ├── Appointment.js    # Booking with video link
│   │   ├── Prescription.js   # Digital prescription
│   │   └── Payment.js        # Razorpay payment record
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Profile
│   │   ├── doctors.js        # List, Search, Profile
│   │   ├── patients.js       # Patient medical history
│   │   ├── appointments.js   # CRUD + Stats + Rating
│   │   ├── prescriptions.js  # Create & View
│   │   ├── payments.js       # Razorpay + Verify
│   │   └── admin.js          # Admin controls
│   ├── middleware/
│   │   └── auth.js           # JWT protect + role authorize
│   ├── utils/
│   │   └── email.js          # Nodemailer email utility
│   └── server.js
│
└── frontend/src/
    ├── context/
    │   └── AuthContext.js    # Global auth state
    ├── pages/
    │   ├── auth/AuthPage.js  # Login/Register + Role select
    │   ├── patient/
    │   │   ├── PatientDashboard.js  # Stats + Charts + Upcoming
    │   │   └── FindDoctors.js       # Search + Book Modal
    │   ├── doctor/
    │   │   └── DoctorDashboard.js   # Appointments management
    │   └── admin/
    │       └── AdminDashboard.js    # System control panel
    ├── components/layout/
    │   └── AppLayout.js      # Role-based sidebar
    └── App.js                # Protected routes per role
```

---

## 🔌 API Reference

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/profile` | Private |

### Appointments
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/appointments` | Patient |
| GET | `/api/appointments` | All roles |
| PUT | `/api/appointments/:id/status` | Doctor/Admin |
| PUT | `/api/appointments/:id/cancel` | Patient |
| PUT | `/api/appointments/:id/rate` | Patient |
| GET | `/api/appointments/stats/dashboard` | All roles |

### Payments (Razorpay)
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/payments/create-order` | Patient |
| POST | `/api/payments/verify` | Patient |
| GET | `/api/payments/history` | All roles |

---

## 🔮 Future Scope

- [ ] Real-time chat between doctor & patient (Socket.io)
- [ ] In-app video calling (WebRTC)
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] AI-based symptom checker
- [ ] Lab report upload & analysis
- [ ] Multi-hospital support
- [ ] Deployed on Render + Vercel

---

## 👨‍💻 Author

**[Your Name]** — MCA Final Year Project  
GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)  
LinkedIn: [Your Profile](https://linkedin.com)

---

## 📄 License
MIT — Free to use for educational purposes.
