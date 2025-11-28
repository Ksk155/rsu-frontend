import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ ADD THIS IMPORT
import rsuLogo from "../assets/rsu-logo-v.png";

export default function Login() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId || !password) {
      setError("Please enter Student ID and Password.");
      return;
    }

    // Prototype rule: password must equal studentId
    if (studentId !== password) {
      setError("Invalid credentials.");
      return;
    }

    const student = {
      student_id: studentId,
      full_name: `Student ${studentId.slice(-2)}`,
      major: "ICT",
    };

    localStorage.setItem("token", "loggedin-token");
    localStorage.setItem("student", JSON.stringify(student));

    navigate("/dashboard");
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">

        {/* ✅ RSU LOGO (TOP) */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={rsuLogo}
            alt="RSU Logo"
            style={{ width: 140, height: "auto" }}
          />
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 8 }}>
          Student Login
        </h2>

        <p style={{ textAlign: "center", marginBottom: 24, color: "var(--subtext)" }}>
          Sign in to access your timetable dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="6510001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Same as Student ID"
            />
          </div>

          {error && (
            <div
              className="card"
              style={{
                background: "#fff4f3",
                borderColor: "#b42318",
                color: "#b42318",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn primary" style={{ width: "100%" }}>
            Sign in
          </button>

          <p
            style={{
              marginTop: 16,
              fontSize: 12,
              textAlign: "center",
              color: "var(--subtext)",
            }}
          >
            * Demo: <b>6510001 / 6510001</b>
          </p>
        </form>
      </div>
    </div>
  );
}
