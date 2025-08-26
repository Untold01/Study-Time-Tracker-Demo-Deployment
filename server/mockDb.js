// mockDb.js
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// In-memory data stores
let users = [];
let subjects = [];
let sessions = [];

export const mockDb = {
  // ---------- Auth Methods ----------
  async findUserByEmail(email) {
    return users.find(u => u.email === email) || null;
  },

  async createUser(name, email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, passwordHash, createdAt: new Date() };
    users.push(user);
    return user;
  },

  async validateUser(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch ? user : null;
  },

  // ---------- Subjects Methods ----------
  async createSubject(userId, name, color) {
    const subject = { id: uuidv4(), userId, name, color, createdAt: new Date() };
    subjects.push(subject);
    return subject;
  },

  async getSubjects(userId) {
    return subjects
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Mimics ORDER BY createdAt ASC
  },

  async deleteSubject(userId, subjectId) {
    const initialLength = subjects.length;
    subjects = subjects.filter(s => !(s.id === subjectId && s.userId === userId));
    return subjects.length < initialLength; // Return true if an item was removed
  },

  // ---------- Sessions Methods ----------
  async createSession(sessionData) {
    const newSession = {
      id: uuidv4(),
      createdAt: new Date(),
      ...sessionData,
      title: sessionData.title || "Study Session",
      date: sessionData.date || new Date().toISOString().slice(0, 10),
      notes: sessionData.notes || "",
      subjectId: sessionData.subjectId || null,
    };
    sessions.push(newSession);
    return newSession;
  },

  async getSessions(userId) {
    // Returns all sessions for the user, filtering and joining will be done in the route
    return sessions.filter(s => s.userId === userId);
  },

  async deleteSession(userId, sessionId) {
    const initialLength = sessions.length;
    sessions = sessions.filter(s => !(s.id === sessionId && s.userId === userId));
    return sessions.length < initialLength;
  },
};