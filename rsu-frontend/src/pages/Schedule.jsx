// src/pages/Schedule.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/apiClient";

const DAY_MAP = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Schedule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- load ALL meeting options once on page load ---
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/api/schedule");
        // backend returns an array of meetings
        setRows(Array.isArray(data) ? data : data?.rows || []);
      } catch (err) {
        console.error("Failed to load schedule", err);
        setError("Failed to load semester schedule.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // --- group by day + sort by start time for display ---
  const groupedByDay = useMemo(() => {
    const byDay = {};
    for (const d of DAY_ORDER) byDay[d] = [];

    for (const m of rows) {
      const key = m.day || "MON";
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(m);
    }

    for (const d of Object.keys(byDay)) {
      byDay[d].sort((a, b) => {
        const at = (a.start_time || "").slice(0, 5);
        const bt = (b.start_time || "").slice(0, 5);
        return at.localeCompare(bt);
      });
    }

    return byDay;
  }, [rows]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Semester Schedule (All Meeting Options)</h1>
        <p className="page-subtitle">
          Below are all timetable meeting options (ICT + GE) stored in the
          system for this semester.
        </p>
      </header>

      <main className="page-content">
        {loading && (
          <div className="alert alert-info">Loading semester schedule…</div>
        )}

        {error && !loading && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="alert alert-info">No schedule rows found.</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Day</th>
                  <th style={{ width: "10%" }}>Course Code</th>
                  <th style={{ width: "26%" }}>Course Name</th>
                  <th style={{ width: "8%" }}>Section</th>
                  <th style={{ width: "16%" }}>Time</th>
                  <th style={{ width: "15%" }}>Room</th>
                  <th style={{ width: "15%" }}>Instructor</th>
                </tr>
              </thead>
              <tbody>
                {DAY_ORDER.map((dayKey) => {
                  const dayRows = groupedByDay[dayKey] || [];
                  if (dayRows.length === 0) return null;

                  return dayRows.map((m, idx) => (
                    <tr key={`${dayKey}-${m.course_code}-${m.section_code}-${m.start_time}-${idx}`}>
                      {/* show day name only for first row of each day block */}
                      <td>
                        {idx === 0 ? (
                          <strong>{DAY_MAP[dayKey] || dayKey}</strong>
                        ) : (
                          ""
                        )}
                      </td>
                      <td>{m.course_code}</td>
                      <td>{m.full_course_name}</td>
                      <td>{m.section_code}</td>
                      <td>
                        {m.start_time?.slice(0, 5)} – {m.end_time?.slice(0, 5)}
                      </td>
                      <td>{m.room || "-"}</td>
                      <td>{m.instructor || "-"}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
