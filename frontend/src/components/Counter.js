import React, { useEffect, useState } from "react";
import axios from "axios";

function Counter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    axios.post("http://127.0.0.1:5000/visit", { user_id: userId })
      .then(res => {
        setData(res.data);
        localStorage.setItem("userId", res.data.user_id);
      })
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={{
      background: "white",
      borderRadius: "15px",
      padding: "30px",
      width: "90%",
      maxWidth: "500px",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
    }}>
      <h1 style={{ marginBottom: "20px" }}>Website Visit Counter</h1>

      <div style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)", borderRadius: "12px", padding: "20px", color: "white", marginBottom: "20px" }}>
        <h3>Your Visit Count</h3>
        <p style={{ fontSize: "3rem", fontWeight: "bold" }}>{data.user_visits}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
          <h4>Total Site Visits</h4>
          <p style={{ fontSize: "2rem" }}>{data.total_visits}</p>
        </div>
        <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
          <h4>Unique Visitors</h4>
          <p style={{ fontSize: "2rem" }}>{data.unique_users}</p>
        </div>
      </div>

      <div style={{ marginTop: "20px", background: "#e9ecef", padding: "10px", borderRadius: "8px" }}>
        <p><b>Your User ID:</b> {data.user_id}</p>
      </div>
    </div>
  );
}

export default Counter;
