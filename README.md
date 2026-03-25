# 🎓 SmartEval — Multi-Agent AI Evaluation Platform

> An AI-powered system that automatically evaluates student answer sheets, analyzes performance, and generates personalized study plans using a multi-agent architecture.

---

## ✨ Overview

**SmartEval** is a full-stack educational platform where teachers can upload exams and answer scripts, and the system automatically evaluates them using OCR + AI.
Students can view marks, analytics, feedback, and receive personalized study guidance from AI agents.

This project demonstrates:

* Multi-Agent AI System
* OCR Document Processing
* Automated Evaluation
* Performance Analytics
* Dashboard UI
* Full-Stack Development

---

## 🧠 Multi-Agent System

SmartEval uses multiple AI agents working together:

| Agent                 | Function                                   |
| --------------------- | ------------------------------------------ |
| 📄 Input Agent        | Extracts text from PDFs/images using OCR   |
| 🧠 Evaluation Agent   | Evaluates answers using rubric             |
| 👨‍👩‍👧 Parent Agent | Generates appreciation/improvement message |
| 🏋️ Trainer Agent     | Creates personalized study plan            |
| 🧮 Memory Agent       | Tracks performance & improvement           |

---

## 👩‍🏫 Teacher Features

* Create Exam
* Upload Question Paper
* Upload Rubric / Marking Scheme
* Upload Answer Scripts
* Automatic AI Evaluation
* View Student Marks
* Analytics Dashboard
* Pass Percentage & Average
* Download PDF Report

---

## 👨‍🎓 Student Features

* Upload Answer Sheet
* View Marks & Feedback
* Performance Analytics
* Progress Graph
* Parent Message
* Personal Trainer Plan
* Memory Insights
* Notifications

---

## 📊 Dashboard Analytics

| Chart          | Description                |
| -------------- | -------------------------- |
| 📈 Line Chart  | Student progress over time |
| 🥧 Pie Chart   | Pass vs Fail               |
| 📊 Bar Chart   | Marks distribution         |
| 📉 Improvement | Performance growth         |

---

## 🛠 Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | Next.js + Tailwind CSS |
| Backend    | FastAPI (Python)       |
| Database   | SQLite / PostgreSQL    |
| AI         | OpenAI API             |
| OCR        | Tesseract              |
| Charts     | Recharts               |
| Auth       | JWT                    |
| Storage    | Local / AWS S3         |
| Deployment | Docker                 |

---

## 📁 Project Structure

```
SmartEval/
│
├── frontend/        # Next.js frontend
├── backend/         # FastAPI backend
├── agents/          # AI agents
├── database/        # DB models
├── tests/           # Testing
├── docker/          # Deployment files
├── README.md
└── docker-compose.yml
```

---

## ⚙️ Installation & Run

### 1️⃣ Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Open App

```
http://localhost:3000
```

API Docs:

```
http://localhost:8000/docs
```

---

## 🔐 Login Roles

| Role    | Access                            |
| ------- | --------------------------------- |
| Teacher | Upload, Evaluate, Analytics       |
| Student | Upload, Marks, Analytics, Trainer |

---

## 🚀 Future Improvements

* AI Plagiarism Detection
* Student Ranking System
* Email Notifications
* Admin Dashboard
* Cloud Deployment
* Mobile App

---

## 📸 Screenshots (Add Later)

* Login Page
* Teacher Dashboard
* Student Dashboard
* Analytics Page
* Upload Page

---

## 👨‍💻 Author

**SmartEval — Multi-Agent AI Educational Platform**
Final Year Project — Artificial Intelligence + Full Stack

---

## ⭐ If you like this project

Give it a star on GitHub!
