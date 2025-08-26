import React from "react";

export default function SessionTable({ sessions, onDelete }) {
  //Created Helper to format minutes into hours and minutes

  function minsToHrs(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  // Created Helper Function for date formatting

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    // The 'timeZone' option is added to ensure the date is parsed correctly in UTC

    return new Date(dateString).toLocaleDateString(undefined, { ...options, timeZone: 'UTC' });
  }

  return (
    <div className="card">
      <h3 className="title">Sessions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Title</th>
            <th>Duration</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            // For Date
            <tr key={s.id}>
              <td>{formatDate(s.date)}</td>
              <td>
                {/* // For Subject Name with colors */} 
                {s.subjectName && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ height: 10, width: 10, backgroundColor: s.subjectColor, borderRadius: '50%', marginRight: 8 }}></span>
                    {s.subjectName}
                  </div>
                )}
              </td>
              {/* For Titles */}
              <td>{s.title}</td>
              <td>{minsToHrs(Number(s.durationMinutes))}</td>
              <td className="muted">{s.notes}</td>
              <td><button className="btn danger" onClick={() => onDelete(s.id)}>Delete</button></td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr><td colSpan={6} className="muted">No sessions yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
