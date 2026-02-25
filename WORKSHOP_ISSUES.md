# Student Management API - 5 Real Issues Workshop

This codebase contains **5 real, unfixed bugs** that require actual code changes to resolve. No comments hint at their locations.

---

## Issue #1: Query Injection Vulnerability

**File:** `src/routes/students.js` → GET `/api/students`

**Problem:**
```javascript
const search = req.query.search;
if (search) {
  query = { $where: `this.firstName.includes('${search}')` };
}
```

**Vulnerability:** User input is directly interpolated into MongoDB `$where` operator using template strings.

**Exploit Example:**
```bash
GET /api/students?search='; return true; //
```
This would return ALL students, bypassing any filters.

**What breaks:**
- NoSQL injection attack possible
- Attacker can extract all data
- Could delete/modify records
- Server could be overloaded with `$where` expressions

**How to verify the bug:**
```bash
# Normal query
curl "http://localhost:3000/api/students?search=John"

# Injection - should fail but executes
curl "http://localhost:3000/api/students?search='; return true; //"
```

---

## Issue #2: Email Validation Missing

**File:** `src/models/Student.js` → email field

**Problem:**
```javascript
email: {
  type: String,
  lowercase: true,
  required: true,
  // NO FORMAT VALIDATION!
}
```

**What breaks:**
- Invalid emails accepted: `"notanemail"`, `"@domain.com"`, `"user@"`, `"user @domain.com"`
- Email notifications would fail
- Database contains garbage data
- Can't reliably contact students

**How to verify the bug:**
```bash
POST /api/students
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "invalid.email",
  "studentId": "S001"
}
# Saves successfully! Should reject.
```

---

## Issue #3: DELETE Endpoint Missing Response

**File:** `src/routes/students.js` → DELETE `/api/students/:id`

**Problem:**
```javascript
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    // MISSING: res.json() response!
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

**What breaks:**
- Client request hangs waiting for response
- No confirmation that deletion worked
- Network timeout errors
- Client-side code waiting for response will crash
- No error/success distinction

**How to verify the bug:**
```bash
DELETE /api/students/{id}
# Request hangs for 30+ seconds until timeout
# No response body even after successful deletion
```

---

## Issue #4: Duplicate Student Enrollment

**File:** `src/routes/courses.js` → POST `/api/courses/:id/enroll`

**Problem:**
```javascript
router.post('/:id/enroll', async (req, res) => {
  const { studentId } = req.body;
  const course = await Course.findById(req.params.id);
  
  // NO CHECK IF ALREADY ENROLLED!
  course.enrolledStudents.push(studentId);
  
  const updated = await course.save();
});
```

**What breaks:**
- Same student appears multiple times in enrolledStudents
- Course roster is inaccurate
- Student takes class credit twice
- GPA calculations are wrong (grades counted twice)
- Email notifications sent multiple times
- Classroom attendance confused

**How to verify the bug:**
```bash
# Enroll student once
POST /api/courses/{courseId}/enroll
{"studentId": "STU001"}
# Response: enrolled: 1

# Enroll SAME student again
POST /api/courses/{courseId}/enroll
{"studentId": "STU001"}
# Response: enrolled: 2 (should be rejected!)

# Check course
GET /api/courses/{courseId}
# enrolledStudents: ["STU001", "STU001"]  <- DUPLICATE!
```

---

## Issue #5: Missing Instructor Validation

**File:** `src/routes/courses.js` → POST `/api/courses`

**Problem:**
```javascript
router.post('/', async (req, res) => {
  const { code, title, credits, faculty, instructor, capacity } = req.body;
  
  const course = new Course({
    code,
    title,
    instructor,  // NO CHECK IF INSTRUCTOR EXISTS!
    faculty,
    capacity,
    // ...
  });
  
  const saved = await course.save();
});
```

**What breaks:**
- Course assigned to non-existent instructor
- Instructor lookup returns null
- Can't fetch instructor details
- Orphaned course records
- Referential integrity broken
- Later queries fail to populate instructor

**How to verify the bug:**
```bash
POST /api/courses
{
  "code": "CS101",
  "title": "Intro to CS",
  "instructor": "507f1f77bcf86cd799439999",
  "capacity": 30
}
# Saves successfully even though instructor doesn't exist
```

**Test it:**
```bash
# Create a course with fake instructor
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CS101",
    "title": "Intro to CS",
    "instructor": "507f1f77bcf86cd799439999",
    "capacity": 30
  }'

# Course is saved with invalid instructor reference
# Later when trying to get course details, instructor field is null
```

**Impact:**
- Invalid references in database
- Foreign key violation
- Orphaned records
- Reporting queries unreliable

---

## Summary

| Issue | Type | Severity | Fix Difficulty |
|-------|------|----------|-----------------|
| #1 Query Injection | Security | CRITICAL | Easy |
| #2 Email Validation | Data Quality | High | Easy |
| #3 No Response | API Bug | High | Easy |
| #4 Duplicate Enrollment | Logic Bug | High | Easy |
| #5 Missing Validation | Data Integrity | High | Easy |

---

## Quick Test Checklist

- [ ] Test invalid email signup
- [ ] Try query injection with special characters
- [ ] Enroll student twice, verify duplicate
- [ ] Delete student and check response
- [ ] Create course with capacity=1, enroll 2 students simultaneously

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

API runs on `http://localhost:3000`

**All 5 issues are live and ready to fix!**
