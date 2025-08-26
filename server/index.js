// index.js (Updated)
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { mockDb as db } from "./mockDb.js";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret-change-me";

const SUBJECT_COLORS = ["#93c5fd", "#86efac", "#fcd34d", "#fca5a5", "#c4b5fd", "#94a3b8"];

app.use(cors());
app.use(express.json());


// ---------- Auth Helpers (Unchanged) ----------
function generateToken(user) {
  return jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---------- Routes ----------

// Health check (Unchanged)
app.get("/", (req, res) => {
  res.json({ ok: true, service: "Study Time Tracker API" });
});

// Register (CHANGED)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const existing = await db.findUserByEmail(email);
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const user = await db.createUser(name || "", email, password);
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});


// Login (CHANGED)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = await db.validateUser(email, password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ---------- Subjects Routes (CHANGED) ----------

// Create subject
app.post("/api/subjects", auth, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Subject name is required" });

    const userSubjects = await db.getSubjects(req.user.uid);
    const colorIndex = userSubjects.length % SUBJECT_COLORS.length;
    const color = SUBJECT_COLORS[colorIndex];
    
    const newSubject = await db.createSubject(req.user.uid, name, color);
    res.status(201).json(newSubject);
});

// List subjects
app.get("/api/subjects", auth, async (req, res) => {
    const subjects = await db.getSubjects(req.user.uid);
    res.json(subjects);
});

// Delete subject
app.delete("/api/subjects/:id", auth, async (req, res) => {
    const { id } = req.params;
    const success = await db.deleteSubject(req.user.uid, id);
    if (!success) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
});


// ---------- Session Routes (CHANGED) ----------

// Create session
app.post("/api/sessions", auth, async (req, res) => {
  const { title, durationMinutes, notes, date, subjectId } = req.body;
  if (!durationMinutes) {
    return res.status(400).json({ error: "durationMinutes is required" });
  }
  const sessionData = { userId: req.user.uid, title, date, durationMinutes, notes, subjectId };
  const newSession = await db.createSession(sessionData);
  res.status(201).json(newSession);
});


// List sessions
app.get("/api/sessions", auth, async (req, res) => {
  const { from, to } = req.query;
  const sessions = await db.getSessions(req.user.uid);
  const subjects = await db.getSubjects(req.user.uid);

  // Create a map for quick subject lookups (mimicking a JOIN)
  const subjectsMap = new Map(subjects.map(sub => [sub.id, sub]));

  let results = sessions
    .filter(s => { // Mimic WHERE clause for dates
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      return true;
    })
    .map(s => { // Mimic LEFT JOIN
      const subject = subjectsMap.get(s.subjectId);
      return {
        ...s,
        subjectName: subject ? subject.name : null,
        subjectColor: subject ? subject.color : null,
      };
    })
    .sort((a, b) => { // Mimic ORDER BY
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

  res.json(results);
});

// Delete session
app.delete("/api/sessions/:id", auth, async (req, res) => {
  const { id } = req.params;
  const success = await db.deleteSession(req.user.uid, id);
  if (!success) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});


// ---------- Stats Routes (CHANGED) ----------

// Stats summary
app.get("/api/stats/summary", auth, async (req, res) => {
  const { from, to } = req.query;
  const sessions = await db.getSessions(req.user.uid);

  const filteredSessions = sessions.filter(s => {
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      return true;
  });

  // Mimic GROUP BY date and SUM(durationMinutes)
  const dailyMinutes = filteredSessions.reduce((acc, session) => {
    acc[session.date] = (acc[session.date] || 0) + session.durationMinutes;
    return acc;
  }, {});

  const days = Object.keys(dailyMinutes).map(date => ({
      date,
      minutes: dailyMinutes[date]
  })).sort((a,b) => a.date.localeCompare(b.date)); // ORDER BY date ASC

  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  res.json({ days, totalMinutes });
});

// Time per subject report
app.get("/api/stats/time-per-subject", auth, async (req, res) => {
    const sessions = await db.getSessions(req.user.uid);
    const subjects = await db.getSubjects(req.user.uid);
    const subjectsMap = new Map(subjects.map(s => [s.id, s]));

    // Mimic GROUP BY subjectId and SUM(durationMinutes)
    const subjectMinutes = sessions.reduce((acc, session) => {
        if (session.subjectId) {
            acc[session.subjectId] = (acc[session.subjectId] || 0) + session.durationMinutes;
        }
        return acc;
    }, {});

    const report = Object.keys(subjectMinutes)
        .map(subjectId => {
            const subject = subjectsMap.get(subjectId);
            return {
                name: subject ? subject.name : "Unknown",
                color: subject ? subject.color : "#94a3b8",
                totalMinutes: subjectMinutes[subjectId]
            }
        })
        .sort((a,b) => b.totalMinutes - a.totalMinutes); // ORDER BY totalMinutes DESC
    
    res.json(report);
});

// Study trend report for last 7 days
app.get("/api/stats/study-trend", auth, async (req, res) => {
    const sessions = await db.getSessions(req.user.uid);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const recentSessions = sessions.filter(s => s.date >= sevenDaysAgoStr);
    
    // Mimic GROUP BY date and SUM(durationMinutes)
    const trend = recentSessions.reduce((acc, session) => {
        acc[session.date] = (acc[session.date] || 0) + session.durationMinutes;
        return acc;
    }, {});

    const result = Object.keys(trend).map(date => ({
        date,
        totalMinutes: trend[date]
    })).sort((a,b) => a.date.localeCompare(b.date)); // ORDER BY date ASC

    res.json(result);
});


app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});