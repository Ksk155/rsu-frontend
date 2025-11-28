// src/pages/CourseSelection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/apiClient";
import rsuLogo from "../assets/rsu-logo-h.png";

export default function CourseSelection() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentData = localStorage.getItem("student");

    if (!token || !studentData) {
      navigate("/login");
      return;
    }

    const student = JSON.parse(studentData);

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // Load all courses
        const allCourses = await apiGet("/api/courses");
        setCourses(allCourses || []);

        // Load previously selected courses
        const saved = await apiGet(
          `/api/student_courses/${student.student_id}`
        );

        const selectedMap = {};
        (saved.selected || []).forEach((cid) => {
          selectedMap[cid] = true;
        });

        setSelected(selectedMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const toggleCourse = (courseId) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[courseId]) delete next[courseId];
      else next[courseId] = true;
      return next;
    });
  };

  const handleSave = async () => {
    const student = JSON.parse(localStorage.getItem("student"));
    const selectedCourses = Object.keys(selected).filter(
      (cid) => selected[cid]
    );

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await apiPost("/api/student_courses", {
        student_id: student.student_id,
        courses: selectedCourses,
      });

      setMessage("Courses saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save courses.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* ✅ HEADER WITH LOGO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Course Selection</h1>
          <p style={{ color: "var(--subtext)" }}>
            Select all subjects you are taking this semester.
          </p>
        </div>

        <img
          src={rsuLogo}
          alt="RSU Logo"
          style={{
            height: 42,
            maxWidth: "120%",
            marginTop: 8,
          }}
        />
      </div>

      {loading && <div>Loading...</div>}

      {error && (
        <div
          style={{
            color: "crimson",
            background: "#ffe5e5",
            padding: 10,
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            color: "green",
            background: "#e4ffe5",
            padding: 10,
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          {message}
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          {courses.map((c) => (
            <label
              key={c.course_id}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                borderBottom: "1px solid #eee",
                padding: "10px 0",
              }}
            >
              <input
                type="checkbox"
                checked={!!selected[c.course_id]}
                onChange={() => toggleCourse(c.course_id)}
              />
              <div>
                <div style={{ fontWeight: 600 }}>
                  {c.course_id} – {c.course_name}
                </div>
                <div style={{ fontSize: 13, color: "var(--subtext)" }}>
                  Credit: {c.credit ?? "—"}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {!loading && (
        <button
          className="btn"
          style={{ marginTop: 20 }}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save Selected Courses"}
        </button>
      )}
    </div>
  );
}
