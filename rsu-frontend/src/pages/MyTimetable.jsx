import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../lib/apiClient";

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

  // ⭐ preferences returned directly from /student-plan
  const [prefs, setPrefs] = useState(null);

  // Load logged-in student
  useEffect(() => {
    const raw = localStorage.getItem("student");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      setStudent(JSON.parse(raw));
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  // ========================================
  // RUN HYBRID (GA + SA)
  // ========================================
  const runHybrid = async () => {
    if (!student) return;

    const id =
      student.student_id ||
      student.student_pid ||
      student.id ||
      student.pid;

    setLoading(true);
    setError("");
    setTimetable([]);

    try {
      // ⭐ Hybrid result already includes: timetable + preferences + credits
      const res = await apiGet(`/api/optimize_hybrid/${id}?r=${Date.now()}`);

      if (res.error) throw new Error(res.error);
      if (res.status !== "ok") throw new Error("Hybrid failed");

      // timetable as returned
      const rows = Array.isArray(res.timetable) ? res.timetable : [];
      setTimetable(rows);

      // ⭐ set preferences directly
      setPrefs(res.preference || null);

    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to generate hybrid timetable.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SAVE HYBRID TIMETABLE
  // ========================================
  const handleSaveTimetable = () => {
    if (!student || timetable.length === 0) return;

    try {
      localStorage.setItem(
        "hybrid_timetable",
        JSON.stringify({
          student_id: student.student_id,
          saved_at: new Date().toISOString(),
          rows: timetable,
          preference: prefs || null,
        })
      );
    } catch (e) {
      console.error("Failed to save timetable locally", e);
    }

    navigate("/timetable");
  };

  // ========================================
  // GROUP BY DAY — EXACTLY AS BEFORE
  // ========================================
  const timetableByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => (map[d] = []));
    timetable.forEach((m) => {
      if (!map[m.day]) map[m.day] = [];
      map[m.day].push(m);
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) =>
        (a.start_time || "").localeCompare(b.start_time || "")
      )
    );

    return map;
  }, [timetable]);

  if (!student) return <div>Loading…</div>;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>My Hybrid Timetable (GA + SA)</h2>

      <p style={{ color: "var(--subtext)", marginBottom: 16 }}>
        Student: <b>{student.full_name}</b> ({student.student_id})
      </p>

      {/* ⭐ SMALL FIX — Preferences block (NO UI CHANGES) */}
      {prefs && (
        <div
          className="card"
          style={{
            padding: 12,
            marginBottom: 16,
            background: "#f7f7ff",
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <b>Avoid Monday:</b> {prefs.avoid_monday === 1 ? "Yes" : "No"}
            <br />
            <b>Preferred Time:</b> {prefs.prefer_time || "None"}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={runHybrid} disabled={loading}>
          {loading ? "Generating…" : "Generate Hybrid"}
        </button>

        <button className="btn ghost" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: "#ffe8e8",
            borderColor: "#cc0000",
            marginBottom: 12,
          }}
        >
          <b>Error:</b> {error}
        </div>
      )}

      {!error && timetable.length === 0 && !loading && (
        <p style={{ color: "var(--subtext)" }}>
          Click <b>“Generate Hybrid”</b> to see your timetable.
        </p>
      )}

      {loading && <p>Running Hybrid GA+SA…</p>}

      {timetable.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3>Your Optimized Weekly Timetable</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 12,
            }}
          >
            {DAYS.map((day) => (
              <div className="card" key={day}>
                <h4 style={{ marginTop: 0 }}>{DAY_LABEL[day]}</h4>

                {timetableByDay[day].length === 0 ? (
                  <p style={{ color: "var(--subtext)", fontSize: 13 }}>
                    No classes
                  </p>
                ) : (
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {timetableByDay[day].map((m, index) => {
                      const start = m.start_time?.slice(0, 5) || "";
                      const end = m.end_time?.slice(0, 5) || "";

                      return (
                        <li key={index} style={{ marginBottom: 6 }}>
                          <b>{m.course_code}</b> — {m.course_name}
                          <br />
                          {start}–{end} • {m.room || "Room TBA"} •{" "}
                          {m.instructor || "Instructor TBA"}
                          <br />
                          <small>Credits: {m.credits}</small>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn"
              onClick={handleSaveTimetable}
              disabled={loading}
            >
              Save Timetable & Go to Semester Timetable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
