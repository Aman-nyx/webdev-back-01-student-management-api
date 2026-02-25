# Student Management API - Workshop Edition

A practical Express.js + MongoDB learning project with **5 real bugs** to find and fix.

This is intentionally built with security vulnerabilities, logic flaws, and data consistency issues for educational purposes.

---

## 🎯 Project Overview

This is a full **Student Management System** API with three interconnected entities:
- **Students** - With enrollment tracking and GPA
- **Courses** - With capacity management and enrollment
- **Faculties** - Departments managing students and courses

**Purpose:** Workshop participants identify and fix 5 real issues embedded in production-like code.

**Stack:** 
- Express.js 4.18.2
- MongoDB + Mongoose 7.5.0
- Node.js with ES6

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

API available at: `http://localhost:3000`

Database: MongoDB (local or via `.env` connection string)

---

## 📋 API Endpoints

### Students
```
GET    /api/students              - List all students (paginated)
GET    /api/students/:id          - Get student details
POST   /api/students              - Create new student
PUT    /api/students/:id          - Update student
DELETE /api/students/:id          - Delete student
PATCH  /api/students/:id/grades   - Update student grade in course
```

### Courses
```
GET    /api/courses               - List courses (by semester)
GET    /api/courses/:id           - Get course details
POST   /api/courses               - Create course
PUT    /api/courses/:id           - Update course
POST   /api/courses/:id/enroll    - Enroll student
POST   /api/courses/:id/unenroll  - Remove student
```

### Faculties
```
GET    /api/faculties             - List all faculties
GET    /api/faculties/:id         - Get faculty details
POST   /api/faculties             - Create faculty
PUT    /api/faculties/:id         - Update faculty
```

---

## 🐛 The 5 Issues You Need to Fix

All issues are **active in the code** (no comments marking them). See [WORKSHOP_ISSUES.md](WORKSHOP_ISSUES.md) for detailed explanations.

### Issue #1: Query Injection (Security) ⚠️ CRITICAL
**File:** `src/routes/students.js` - GET `/api/students` with search parameter
- User search input directly interpolated into MongoDB `$where` operator
- **Impact:** NoSQL injection, data exfiltration, query bypass
- **Difficulty:** ⭐ Easy
- **Fix Type:** Use parameterized queries or regex operator

### Issue #2: Missing Email Validation (Data Quality)
**File:** `src/models/Student.js` - email field
- Email field accepts any string format without validation
- **Impact:** Invalid emails stored, notifications fail, bad data
- **Difficulty:** ⭐ Easy
- **Fix Type:** Add regex pattern validation to schema

### Issue #3: No API Response (API Bug)
**File:** `src/routes/students.js` - DELETE `/api/students/:id`
- DELETE endpoint missing response body after successful deletion
- **Impact:** Client hangs, no success/failure confirmation, timeouts
- **Difficulty:** ⭐ Easy
- **Fix Type:** Add response statement before closing request

### Issue #4: Duplicate Student Enrollment (Logic Bug)
**File:** `src/routes/courses.js` - POST `/api/courses/:id/enroll`
- No check if student already enrolled in course
- **Impact:** Same student listed multiple times, GPA calculations wrong, data corruption
- **Difficulty:** ⭐⭐ Medium
- **Fix Type:** Add array duplicate check before push

### Issue #5: Missing Instructor Validation (Data Integrity)
**File:** `src/routes/courses.js` - POST `/api/courses`
- Course can be assigned to non-existent instructor without validation
- **Impact:** Orphaned records, broken references, reporting fails
- **Difficulty:** ⭐ Easy
- **Fix Type:** Validate instructor exists before saving

---

## 🧪 Testing the Issues

### Test Issue #1 (Query Injection)
```bash
# Normal search
curl "http://localhost:3000/api/students?search=John"

# Injection attempt (will return unexpected/all results)
curl "http://localhost:3000/api/students?search='; return true; //"
```

### Test Issue #2 (Email Validation)
```bash
# Invalid email should be rejected but isn't
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "not-an-email",
    "studentId": "S001"
  }'

# Result: Student created with invalid email
```

### Test Issue #3 (No Response)
```bash
# DELETE will hang with no response
curl -X DELETE http://localhost:3000/api/students/{student_id}
# Timeout after 30+ seconds with no body
```

### Test Issue #4 (Duplicate Enrollment)
```bash
# First, create a course
COURSE_ID=$(curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"code":"CS101","title":"Intro to CS","capacity":50}' | jq '.id')

# Enroll student once
curl -X POST http://localhost:3000/api/courses/$COURSE_ID/enroll \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU001"}'

# Enroll SAME student again (should fail but succeeds)
curl -X POST http://localhost:3000/api/courses/$COURSE_ID/enroll \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STU001"}'

# Check result - student appears twice
curl http://localhost:3000/api/courses/$COURSE_ID
# enrolledStudents: ["STU001", "STU001"]  <- DUPLICATE!
```

### Test Issue #5 (Missing Instructor Validation)
```bash
# Create course with fake instructor ID
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS101",
    "title": "Intro to CS",
    "instructor": "507f1f77bcf86cd799439999",
    "capacity": 30
  }'

# Course saves successfully even though instructor doesn't exist
# Should reject but doesn't
```

---

## 📁 Project Structure

```
src/
├── models/           # Mongoose schemas
│   ├── Student.js    # Issue #2 here
│   ├── Course.js
│   └── Faculty.js
├── routes/           # API endpoints  
│   ├── students.js   # Issues #1, #3 here
│   ├── courses.js    # Issues #4, #5 here
│   └── faculties.js
├── config/
│   └── database.js   # MongoDB connection
├── middleware/
│   └── errorHandler.js
└── server.js         # Express app setup

WORKSHOP_ISSUES.md    # Detailed bug descriptions & fixes
README.md             # This file
.env.example          # Configuration template
package.json          # Dependencies
```

---

## ✅ Verification Checklist

After fixing all 5 issues, verify:

- [ ] **Issue #1:** Query injection prevented - use `$regex` operator or parameterized queries instead of `$where`
- [ ] **Issue #2:** Email validation enforced - add `match` property to schema  
- [ ] **Issue #3:** DELETE endpoint returns response - add `res.json()` or `res.send()`
- [ ] **Issue #4:** Second enrollment rejected - add `.includes()` check before `.push()`
- [ ] **Issue #5:** Instructor validated - check if instructor exists before saving course

---

## 📚 Learning Resources

- **NoSQL Injection:** [OWASP - NoSQL Injection](https://owasp.org/www-community/NoSQL_Injection)
- **MongoDB Security:** [MongoDB Security Documentation](https://www.mongodb.com/docs/manual/security/)
- **Email Validation:** [RFC 5322 Email Format](https://tools.ietf.org/html/rfc5322)
- **Race Conditions:** [Preventing Race Conditions in Databases](https://en.wikipedia.org/wiki/Race_condition)
- **MongoDB Transactions:** [Multi-Document Transactions](https://www.mongodb.com/docs/manual/core/transactions/)

---

## 🎓 Workshop Instructions

1. **Read** [WORKSHOP_ISSUES.md](WORKSHOP_ISSUES.md) for complete detail on each issue
2. **Run** the API: `npm run dev`
3. **Test** each issue using curl commands above
4. **Find** the problematic code in `src/`
5. **Fix** each issue properly (error handling, validation, etc.)
6. **Verify** your fixes work with test cases
7. **Commit** and document your changes

**Important:** No comments mark the issue locations - you must find them!

---

## 🚀 After the Workshop

This project demonstrates real-world bugs:
- **Security:** Query injection vulnerabilities
- **Data Quality:** Missing validation
- **API Design:** Proper response handling
- **Logic Bugs:** Duplicate data handling
- **Concurrency:** Race conditions in distributed systems

Apply these lessons to prevent bugs in production!

---

## 📊 Difficulty Progression

**Start here (Easy):**
- Issue #2 - Email validation
- Issue #3 - Missing response
- Issue #5 - Instructor validation

**Then tackle (Medium):**
- Issue #1 - Query injection
- Issue #4 - Duplicate enrollment

---

## ⚙️ Configuration

`.env` file required:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/student_management
NODE_ENV=development
```

Create from `.env.example`:
```bash
cp .env.example .env
```

---

## 🔗 Related Files

- **Issues Guide:** [WORKSHOP_ISSUES.md](WORKSHOP_ISSUES.md) - Detailed explanations with examples
- **Source Code:** `src/` directory - Find and fix the bugs here
- **Models:** `src/models/` - Student, Course, Faculty schemas

---

## 📝 License

Educational content for learning purposes.
