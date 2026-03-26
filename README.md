# 💸 Prospera — AI-Powered Financial Wellness Platform

> Intelligent Budget Forecasting • Financial Health Assessment • AI-Driven Insights

---

## 🚀 Live Demo

* 🔗 Frontend: https://prospera-financial-wellness-app.onrender.com/
* 🔗 Backend API: https://prospera-financial-wellness-app-backend.onrender.com

---

## 📑 Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
* [AI Integration](#ai-integration)
* [Installation](#installation)
* [API Endpoints](#api-endpoints)
* [Security](#security)
* [Performance](#performance)
* [Deployment](#deployment)
* [Project Impact](#project-impact)

---

<a id="overview"></a>

## 🎯 Overview

A **production-ready AI-powered financial SaaS platform** designed to help users:

* Track and manage expenses
* Forecast future budgets using AI
* Analyze financial health with scoring models
* Receive personalized financial recommendations

Built using **MERN Stack + Google Gemini AI** 

---

<a id="key-features"></a>

## ✨ Key Features

### 🧠 AI Financial Health Assessment

* 0–100 financial health score
* Multi-factor evaluation:

  * Income vs Expenses
  * Savings Rate
  * Debt Ratio
  * Emergency Fund
* AI-generated recommendations

---

### 🔮 Intelligent Budget Forecasting

* Configurable forecasting (1–6 months)
* Weekly / Monthly breakdown
* Risk detection and confidence scoring
* Category-wise budget suggestions

---

### 💰 Transaction Management

* Full CRUD operations
* Recurring transactions
* Category-based tracking
* Payment method support

---

### 📊 Analytics & Reporting

* Spending pattern analysis
* Financial dashboards
* Exportable reports (CSV/PDF)
* Scheduled report generation

---

### 🔐 User Management & Security

* JWT-based authentication
* Role-based access control
* Secure APIs with validation

---

<a id="technology-stack"></a>

## 🛠️ Technology Stack

### Frontend

* React 19
* TypeScript
* Tailwind CSS
* Redux Toolkit

### Backend

* Node.js
* Express.js
* MongoDB

### AI & Services

* Google Gemini AI
* Cloudinary
* Resend

---

<a id="architecture"></a>

## 🏗️ Architecture

```
Frontend (React)
        ↓
Backend (Node.js + Express)
        ↓
MongoDB Database
        ↓
Google Gemini AI
```

---

<a id="ai-integration"></a>

## 🤖 AI Integration

### AI Capabilities

* Financial health scoring
* Budget prediction
* Spending pattern analysis
* Personalized recommendations

### Example Flow

1. User data is collected from transactions
2. Backend processes financial metrics
3. Gemini AI analyzes data
4. Insights + recommendations are generated

---

<a id="installation"></a>

## ⚙️ Installation

### 1. Clone Repository

```
git clone <repository-url>
cd project
```

### 2. Install Dependencies

**Backend**

```
cd backend
npm install
```

**Frontend**

```
cd client
npm install
```

---

<a id="api-endpoints"></a>

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Transactions

```
GET /api/transaction
POST /api/transaction
PUT /api/transaction/:id
DELETE /api/transaction/:id
```

### AI Features

```
POST /api/ai/budget-forecast
GET /api/financial-health/latest
GET /api/analytics/summary
```

---

<a id="security"></a>

## 🔐 Security

* JWT Authentication
* Input validation
* Secure API design
* Data isolation per user

---

<a id="performance"></a>

## ⚡ Performance

* Optimized database queries
* Async backend processing
* Efficient state management (Redux)
* Scalable architecture

---

<a id="deployment"></a>

## 🚀 Deployment

* Backend → Render
* Frontend → Render
* Database → MongoDB Atlas
* AI → Google Gemini

---

<a id="project-impact"></a>

## 🌟 Project Impact

* ✅ AI-driven financial decision making
* ✅ Real-time analytics for users
* ✅ Scalable SaaS architecture
* ✅ Production-ready deployment

---

## 📌 Conclusion

This project demonstrates:

* Full-stack engineering (MERN)
* AI integration in real-world systems
* Secure and scalable backend design
* Cloud deployment practices

---

⭐ *Built to solve real-world financial problems using AI + Cloud*
