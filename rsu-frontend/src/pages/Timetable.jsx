// src/pages/Timetable.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/apiClient";
import { detectConflicts, exportICS } from "../lib/timetable";

export default function Timetable() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState(null);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCourses = state?.selectedCourses ?? [];

  useEffect(() => {
    const raw = localStorage.getItem("student");
    if (!raw) {
      navigate("/login");
      return;
    }

    try {
      const student = JSON.parse(raw);
      if (!student.student_id) throw new Error("missing id");
      setStudentId(student.student_id);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!studentId) return;

    const saved = localStorage.getItem("hybrid_timetable");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.student_id === studentId) {
          const fixed = (obj.rows || []).map((r) => ({
            ...r,
            course_code: r.course_code,
            course_name: r.course_name || r.full_course_name || "",
            credits: r.credits ?? "—",
            section_code: r.section_code ?? r.section ?? null,
          }));
          setPlan(fixed);
          return;
        }
      } catch {}
    }

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiGet(`/api/student-plan/${studentId}`);
        let rows = [];

        if (res && Array.isArray(res.timetable)) {
          rows = res.timetable;
        }

        const normalized = rows.map((r) => ({
          ...r,
          course_code: r.course_code,
          course_name: r.course_name || r.full_course_name || "",
          credits: r.credits ?? r.credit ?? "—",
          section_code: r.section_code ?? r.section ?? null,
        }));

        let filtered = normalized;
        if (selectedCourses.length > 0) {
          filtered = normalized.filter((row) =>
            selectedCourses.includes(row.course_code)
          );
        }

        setPlan(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to load semester timetable.");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, selectedCourses]);

  const conflicts = useMemo(() => detectConflicts(plan), [plan]);

  const onExportICS = () => {
    if (!plan || plan.length === 0) {
      alert("There is no timetable to export.");
      return;
    }
    exportICS(plan, "RSU Semester Timetable");
  };

  if (!studentId && !loading && !error) {
    return <div>Loading…</div>;
  }

  return (
    <div className="card">
      
      {/* ✅ TOP RIGHT ACTION (beside Logout visually) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "8px",
        }}
      >
        <button
          className="btn ghost"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <h2 style={{ marginTop: 0 }}>Semester Timetable</h2>

      {error && (
        <div
          className="card"
          style={{
            borderColor: "#b42318",
            background: "#fff4f3",
            marginBottom: 12,
          }}
        >
          <b>Error:</b> {error}
        </div>
      )}

      {conflicts.length > 0 && (
        <div
          className="card"
          style={{
            background: "#fff8e1",
            borderColor: "#b58900",
            marginBottom: 12,
          }}
        >
          <b>Conflicts detected:</b>
          <ul>
            {conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <Link to="/preferences" className="btn">
            Adjust Preferences &amp; Regenerate
          </Link>
        </div>
      )}

      {/* TABLE */}
      <div className="card printable-area" style={{ padding: "0px" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Course Code</th>
              <th style={{ width: 90 }}>Section</th>
              <th>Course Name</th>
              <th style={{ width: 90 }}>Credits</th>
              <th style={{ width: 150 }}>Day</th>
              <th style={{ width: 170 }}>Time Slot</th>
              <th style={{ width: 140 }}>Room</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7">Loading…</td>
              </tr>
            )}

            {!loading &&
              plan.map((r, i) => {
                const start = r.start_time?.slice(0, 5) || "";
                const end = r.end_time?.slice(0, 5) || "";

                return (
                  <tr key={i}>
                    <td>{r.course_code}</td>
                    <td>{r.section_code || "—"}</td>
                    <td>{r.course_name}</td>
                    <td>{r.credits}</td>
                    <td>{r.day}</td>
                    <td>{start && end ? `${start}–${end}` : "—"}</td>
                    <td>{r.room ?? "—"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* BOTTOM BUTTONS (Back button REMOVED here ✅) */}
      <div
        className="print-remove"
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "8px",
          marginTop: "12px",
          pointerEvents: "auto",
        }}
      >
        <button className="btn" type="button" onClick={onExportICS}>
          Export (.ics)
        </button>

        <a
          href={`/timetable/download?id=${studentId}`}
          className="btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Timetable Page
        </a>
      </div>
    </div>
  );
}
