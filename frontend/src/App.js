import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

function App() {
  const [data, setData] = useState(null);

  // ✅ Only fetch stats (no increment)
  const fetchStats = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    axios
      .get(`http://localhost:5000/stats?user_id=${userId}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("❌ API Error:", err));
  };

  // ✅ Increment visit (for first load or simulate)
  const incrementVisit = () => {
    const userId = localStorage.getItem("userId");
    axios
      .post("http://localhost:5000/visit", { user_id: userId })
      .then((res) => {
        setData(res.data);
        localStorage.setItem("userId", res.data.user_id);
      })
      .catch((err) => console.error("❌ API Error:", err));
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // returning user → just get stats
      fetchStats();
    } else {
      // first-time visitor → increment
      incrementVisit();
    }
  }, []);

  const handleReset = () => {
    const userId = localStorage.getItem("userId");
    axios.post("http://localhost:5000/reset", { user_id: userId }).then((res) => {
      setData(res.data);
      localStorage.setItem("userId", res.data.user_id);
      alert(`✅ Your ID has been reset.\nNew User ID: ${res.data.user_id}`);
    });
  };

  const handleSimulate = () => {
    const userId = localStorage.getItem("userId");
    axios.post("http://localhost:5000/simulate", { user_id: userId }).then((res) => {
      setData(res.data);
      localStorage.setItem("userId", res.data.user_id);
      alert("👥 Simulated 5 new users with random visits!");
    });
  };

  if (!data) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  const COLORS = ["#0088FE", "#00C49F"];
  const chartData = [
    { name: "Your Visits", value: data.user_visits },
    { name: "Others", value: data.total_visits - data.user_visits },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "30px",
          width: "95%",
          maxWidth: "600px",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333" }}>🌍 Website Visit Counter</h1>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Track how many times users have visited this website in real-time.
        </p>

        {/* Stats cards */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px", justifyContent: "center" }}>
          <div style={{ flex: 1, background: "#007bff", color: "white", padding: "15px", borderRadius: "10px" }}>
            <h3>Total Visits</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.total_visits}</p>
          </div>
          <div style={{ flex: 1, background: "#28a745", color: "white", padding: "15px", borderRadius: "10px" }}>
            <h3>Unique Visitors</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.unique_users}</p>
          </div>
        </div>

        {/* Pie Chart (centered) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
          <PieChart width={320} height={280}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* User stats (color cards) */}
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #6a11cb, #a4508b)",
              color: "white",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h4>User ID</h4>
            <p style={{ fontSize: "0.9rem", wordBreak: "break-all" }}>{data.user_id}</p>
          </div>
          <div style={{ background: "#0d6efd", color: "white", padding: "15px", borderRadius: "10px" }}>
            <h4>Your Visits</h4>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{data.user_visits}</p>
          </div>
          <div style={{ background: "#198754", color: "white", padding: "15px", borderRadius: "10px" }}>
            <h4>Last Visit</h4>
            <p style={{ fontSize: "0.9rem" }}>{data.last_visit ? data.last_visit : "First visit!"}</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: "25px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#0d6efd",
              color: "white",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={incrementVisit} // ✅ changed
            onMouseOver={(e) => (e.target.style.background = "#0b5ed7")}
            onMouseOut={(e) => (e.target.style.background = "#0d6efd")}
          >
            Simulate Visit
          </button>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#6c757d",
              color: "white",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={handleReset}
            onMouseOver={(e) => (e.target.style.background = "#5c636a")}
            onMouseOut={(e) => (e.target.style.background = "#6c757d")}
          >
            Reset My ID
          </button>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#198754",
              color: "white",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={handleSimulate}
            onMouseOver={(e) => (e.target.style.background = "#157347")}
            onMouseOut={(e) => (e.target.style.background = "#198754")}
          >
            Simulate 5 Users
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
