import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { api } from "../api";

export default function Subjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  // Function to fetch subjects from the API
  async function loadSubjects() {
    try {
      const data = await api("/api/subjects", { token });
      setSubjects(data);
    } catch (e) {
      console.error("Failed to load subjects", e);
    }
  }

  // Load subjects on component mount
  useEffect(() => { loadSubjects();}, []);

  // Added Handler function for adding a new subject
  async function handleAdd(e) {
    e.preventDefault();
    setErr("");
    if (!name) {
      setErr("Subject name cannot be empty.");
      return;
    }
    try {
      await api("/api/subjects", { method: "POST", token, body: { name } });
      setName("");                                                              // Clears the input field
      await loadSubjects();                                                    
    } catch (e) {
      setErr(e.message || "Failed to add subject");
    }
  }
  
  // Added Handler function for deleting a subject
  async function handleDelete(id) {
    if (window.confirm("Are you sure? Deleting a subject will unassign it from all related sessions.")) {
      try {
        await api(`/api/subjects/${id}`, { method: "DELETE", token });
        await loadSubjects();                                                   // Refreshes the list
      } catch (e) {
        setErr(e.message || "Failed to delete subject");
      }
    }
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 className="title">Manage Subjects</h2>
      <form onSubmit={handleAdd} className="row" style={{ alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input 
            className="input" 
            placeholder="Enter new subject name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
        <button className="btn" type="submit">+ Add</button>
      </form>
      {err && <p className="muted" style={{color: '#dc2626', marginTop: 8}}>{err}</p>}
      <div className="spacer"></div>
      <div>
        {subjects.map(sub => (
          <div key={sub.id} className="row" style={{ padding: "12px 0", borderBottom: '1px solid #1f2937', alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: sub.color, marginRight: 12 }}></div>
            <span style={{ flex: 1 }}>{sub.name}</span>
            <button className="btn danger" onClick={() => handleDelete(sub.id)}>Delete</button>
          </div>
        ))}
        {subjects.length === 0 && <p className="muted">No subjects added yet.</p>}
      </div>
    </div>
  );
}
