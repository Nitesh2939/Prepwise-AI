import React, { useEffect, useState } from "react";

export default function Dashboard({ setPage }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/interviews")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => console.log("Error loading dashboard"));
  }, []);

  const avg =
    data.length > 0
      ? (
          data.reduce((a, b) => a + (Number(b.score) || 0), 0) /
          data.length
        ).toFixed(1)
      : 0;

  return (
    <div style={{ padding: "40px", color: "#fff" }}>
      
      <h1 style={{ marginBottom: 20 }}>📊 Dashboard</h1>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <div>Total Interviews: {data.length}</div>
        <div>Avg Score: {avg}</div>
      </div>

      {/* HISTORY */}
      <h2>Interview History</h2>

      {data.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #333",
            padding: 15,
            marginTop: 10,
            borderRadius: 10
          }}
        >
          <p>Role: {item.role}</p>
          <p>Score: {item.score}</p>
          <p>Date: {new Date(item.date).toLocaleString()}</p>
        </div>
      ))}

      <button onClick={() => setPage("landing")} style={{ marginTop: 20 }}>
        ← Back
      </button>
    </div>
  );
}