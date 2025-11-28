import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../lib/apiClient";
import rsuLogo from "../assets/rsu-logo.png";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DAY_LABEL = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

export default function MyTimetable() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("student");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      setStudent(JSON.parse(raw));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const runHybrid = async () => {
    if (!student) return;

    const id = student.student_id;
    setLoading(true);
    setError("");
    setTimetable([]);

    try {
      const res = await apiGet(`/api/optimize_hybrid/${id}?r=${Date.now()}`);
      if (res.error || res.status !== "ok") throw new Error("Hybrid failed");

      setTimetable(Array.isArray(res.timetable) ? res.timetable : []);
      setPrefs(res.preference || null);
    } catch (err) {
      setError(err.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  const timetableByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => (map[d] = []));
    timetable.forEach((m) => map[m.day]?.push(m));
    return map;
  }, [timetable]);

  if (!student) return <div>Loading…</div>;

  return (
    <div className="card">
      {/* ✅ TITLE + LOGO ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h2 style={{ margin: 0 }}>
          My Hybrid Timetable (GA + SA)
        </h2>

        <img
          src={rsuLogo}
          alt="RSU Logo"
          style={{
            height: 38,
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <p style={{ color: "var(--subtext)", marginBottom: 16 }}>
        Student: <b>{student.full_name}</b> ({student.student_id})
      </p>

      {prefs && (
        <div className="card" style={{ background: "#f7f7ff", marginBottom: 16 }}>
          <b>Avoid Monday:</b> {prefs.avoid_monday ? "Yes" : "No"}
          <br />
          <b>Preferred Time:</b> {prefs.prefer_time || "None"}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button className="btn" onClick={runHybrid} disabled={loading}>
          {loading ? "Generating…" : "Generate Hybrid"}
        </button>

        <button className="btn ghost" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      {error && (
        <div className="card" style={{ background: "#ffe8e8" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {timetable.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Weekly Timetable</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {DAYS.map((day) => (
              <div className="card" key={day}>
                <h4>{DAY_LABEL[day]}</h4>
                {timetableByDay[day].length === 0 ? (
                  <p>No classes</p>
                ) : (
                  <ul>
                    {timetableByDay[day].map((m, i) => (
                      <li key={i}>
                        <b>{m.course_code}</b> — {m.course_name}
                        <br />
                        {m.start_time?.slice(0, 5)}–
                        {m.end_time?.slice(0, 5)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
