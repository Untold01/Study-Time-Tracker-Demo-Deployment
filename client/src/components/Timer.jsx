import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { api } from "../api";

export default function Timer({ onSaved }) {
  const { token } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]); 
  const intervalRef = useRef(null);

  // Load subjects from the dropdown
  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await api("/api/subjects", { token });
        setSubjects(data);
      } catch (e) {
        console.error("Failed to load subjects", e);
      }
    }
    loadSubjects();
  }, []);

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Formatted seconds into HH:MM:SS
  function fmt(n) {
    const h = Math.floor(n / 3600).toString().padStart(2, "0");
    const m = Math.floor((n % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(n % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Saving session with selected subjects 

  async function saveSession() {
    const mins = Math.max(1, Math.round(seconds / 60));
    const body = { title: title || "Study Session", durationMinutes: mins, notes, subjectId };
    await api("/api/sessions", { method: "POST", token, body });
    // Reset state
    
    setSeconds(0); setRunning(false); setTitle(""); setNotes(""); setSubjectId("");
    onSaved?.();
  }

  return (
    <div className="card">
      <h3 className="title">Timer</h3>
      <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2 }}>{fmt(seconds)}</div>
      <div className="spacer"></div>
      <div className="row">
        <button className="btn" onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
        <button className="btn secondary" onClick={() => { setSeconds(0); setRunning(false); }}>Reset</button>

        {/*It will disable save button if no subject is selected */}

        <button className="btn" onClick={saveSession} disabled={seconds < 5 || !subjectId}>Save Session</button>
      </div>
      <div className="spacer"></div>
      
      {/* // Subject selector */}

      <select className="select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
        <option value="">-- Select a Subject --</option>
        {subjects.map(sub => (
          <option key={sub.id} value={sub.id}>{sub.name}</option>
        ))}
      </select>
      <div className="spacer"></div>
      <input className="input" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
      <div className="spacer"></div>
      <textarea className="textarea" placeholder="Notes (optional)" rows={3} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
    </div>
  );
}
