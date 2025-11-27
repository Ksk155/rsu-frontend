// src/pages/Preferences.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/apiClient";

const TIMES = ["Morning", "Afternoon"];

export default function Preferences() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  const [avoidMonday, setAvoidMonday] = useState(false);
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const studentJson = localStorage.getItem("student");
    if (!studentJson) {
      navigate("/login");
      return;
    }

    const s = JSON.parse(studentJson);
    setStudent(s);

    const load = async () => {
      try {
        const pref = await apiGet(`/api/preferences/${s.student_id}`);

        if (pref) {
          setAvoidMonday(pref.avoid_monday === 1);
          setTime(pref.prefer_time || "");
        }
      } catch (err) {
        setError("Failed to load your preferences.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    if (!time) {
      setError("Please select preferred time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const res = await apiPost("/api/preferences", {
        student_id: student.student_id,
        avoid_monday: avoidMonday ? 1 : 0,
        prefer_time: time,
      });

      if (res.status === "created" || res.status === "updated") {
        setMessage("Preferences saved successfully.");
      } else {
        setError("Failed to save preferences.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (!student) return <div>Loading…</div>;

  return (
    <div className="container" style={{ marginTop: 32, maxWidth: 520 }}>
      <h1 style={{ marginBottom: 10 }}>Schedule Preferences</h1>

      <p style={{ color: "var(--subtext)", marginBottom: 20 }}>
        Select your preferred options. The timetable engine will avoid Monday when possible.
      </p>

      {loading ? (
        <div>Loading your preferences…</div>
      ) : (
        <div className="card" style={{ padding: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            
            {/* Avoid Monday */}
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>
                Avoid Monday (when possible)
              </label>
              <input
                type="checkbox"
                checked={avoidMonday}
                onChange={(e) => setAvoidMonday(e.target.checked)}
              />
            </div>

            {/* Preferred Time */}
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>
                Preferred Time
              </label>
              <select
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">-- Select Time --</option>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{
                color: "crimson",
                background: "#ffe5e5",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{
                color: "green",
                background: "#e3ffe5",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 14,
              }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
