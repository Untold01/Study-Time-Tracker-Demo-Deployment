import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../AuthContext";
import { api } from "../api";
import Timer from "../components/Timer";
import SessionTable from "../components/SessionTable";

export default function Dashboard() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState({ days: [], totalMinutes: 0 });

  // Function to load sessions and summary data from the API

  async function loadData() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
      // Here the api fetches both sessions and summary data based on the date range
      const sessionList = await api(`/api/sessions?${params.toString()}`, { token });
      setSessions(sessionList);
      
      const summaryData = await api(`/api/stats/summary?${params.toString()}`, { token });
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  }

  // When 'from' or 'to' range of date changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [from, to]);

  // User functioning for deleting the session data
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await api(`/api/sessions/${id}`, { method: "DELETE", token });
        await loadData();                                                   // Reload data after deleting
      } catch (err) {
        console.error("Failed to delete session", err);
      }
    }
  }

  // Memorized calculation for total hours
  const totalHrs = useMemo(() => (summary.totalMinutes / 60).toFixed(2), [summary]);

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      
      {/* Timer Module */}
      <div style={{ flex: 1, minWidth: 300 }}>
        <Timer onSaved={loadData} />
        <div className="spacer"></div>
        
        {/* Filter Module */}
        <div className="card">
          <h3 className="title">Filter</h3>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label className="muted">From</label>
              <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="muted">To</label>
              <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div style={{ alignSelf: "end" }}>
              <button className="btn secondary" onClick={() => { setFrom(""); setTo(""); }}>Clear</button>
            </div>
          </div>
        </div>
        <div className="spacer"></div>

        {/* Summary Module */}
        <div className="card">
          <h3 className="title">Summary</h3>
          <p>Total time: <strong>{totalHrs} hrs</strong></p>
          <ul className="muted" style={{ marginTop: 8, paddingLeft: 20 }}>
            {summary.days.map(d => (
              <li key={d.date}>
                {new Date(d.date).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' })}: <strong>{(d.minutes/60).toFixed(2)} hrs</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Session Column */}
      <div style={{ flex: 2, minWidth: 400, marginLeft: 16 }}>
        <SessionTable sessions={sessions} onDelete={handleDelete} />
      </div>
    </div>
  );
}
