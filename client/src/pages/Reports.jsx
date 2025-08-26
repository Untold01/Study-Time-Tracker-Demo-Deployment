import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../AuthContext';
import { api } from '../api';

// Implementing Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

export default function Reports() {
  const { token } = useAuth();
  const [subjectData, setSubjectData] = useState(null);
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        // Fetching data for the "Time per Subject" chart
        const subjects = await api("/api/stats/time-per-subject", { token });
        setSubjectData({
          labels: subjects.map(s => s.name),
          datasets: [{
            label: 'Minutes Studied',
            data: subjects.map(s => s.totalMinutes),
            backgroundColor: subjects.map(s => s.color),
          }],
        });

        // Fetching data for the "Study Trend" chart
        const trend = await api("/api/stats/study-trend", { token });
        const trendLabels = trend.map(t => t.date);
        const trendValues = trend.map(t => (t.totalMinutes / 60).toFixed(2));
        setTrendData({
          labels: trendLabels,
          datasets: [{
            label: 'Hours Studied',
            data: trendValues,
            borderColor: '#818cf8',
            backgroundColor: '#c7d2fe',
            fill: false,
            tension: 0.1,
          }],
        });
      } catch (err) {
        console.error("Failed to load report data", err);
      }
    }
    loadReportData();
  }, []);

  // Common options for both charts
  
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { 
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2937' } }
    },
  };
  

  return (
    <div>
      <div className="card">
        <h3 className="title">Time per Subject (minutes)</h3>
        {subjectData ? <Bar options={options} data={subjectData} /> : <p className="muted">Loading chart data...</p>}
      </div>
      <div className="spacer"></div>
      <div className="card">
        <h3 className="title">Study Trend (last 7 days in hours)</h3>
        {trendData ? <Line options={options} data={trendData} /> : <p className="muted">Loading chart data...</p>}
      </div>
    </div>
  );
}
