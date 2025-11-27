import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ ADD LOGO IMPORT
import rsuLogoH from "../assets/rsu-logo-h.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("student");
    if (!data) {
      navigate("/login");
      return;
    }
    setStudent(JSON.parse(data));
  }, [navigate]);

  if (!student) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("student");
    navigate("/login");
  };

  return (
    <div className="container" style={{ marginTop: 40 }}>

      {/* ✅ RSU LOGO (above welcome, responsive) */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <img
          src={rsuLogoH}
          alt="RSU Logo"
          style={{
            maxWidth: "180px",   // ✅ fits mobile screens
            width: "100%",
            height: "auto",
          }}
        />
      </div>

      <h1 style={{ marginBottom: 10 }}>
        Welcome, {student.full_name}
      </h1>

      <p style={{ color: "var(--subtext)", marginBottom: 25 }}>
        Student ID: <b>{student.student_id}</b>
        <br />
        {student.major && (
          <>
            Major: <b>{student.major}</b>
          </>
        )}
      </p>

      <div className="card" style={{ padding: 20 }}>
        <h2>Your Menu</h2>

        <div style={{ display: "grid", gap: 10, marginTop: 15 }}>
          <button className="btn" onClick={() => navigate("/schedule")}>
            📅 View Class Schedule
          </button>

          <button
            className="btn"
            onClick={() => navigate("/course-selection")}
          >
            📚 Course Selection
          </button>

          <button className="btn" onClick={() => navigate("/preferences")}>
            ⭐ Set Preferences
          </button>

          <button className="btn" onClick={() => navigate("/mytimetable")}>
            🗓 My Timetable (GA / SA)
          </button>

          <button className="btn" onClick={() => navigate("/timetable")}>
            🗂 Semester Timetable
          </button>

          <button
            className="btn"
            style={{ background: "#c62828" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
