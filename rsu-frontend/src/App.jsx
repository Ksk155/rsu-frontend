// src/App.jsx
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CourseSelection from "./pages/CourseSelection.jsx";
import Preferences from "./pages/Preferences.jsx";
import Timetable from "./pages/Timetable.jsx";
import NotFound from "./pages/NotFound.jsx";
import Schedule from "./pages/Schedule.jsx";
import MyTimetable from "./pages/MyTimetable.jsx";
import TimetableDownload from "./pages/TimetableDownload.jsx";
import { logout } from "./lib/apiClient";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("student");

  const hideHeaderFooter =
    location.pathname === "/" || location.pathname === "/login";

  const hideNavButtons = location.pathname === "/timetable";

  const handleLogout = () => {
    logout();
    localStorage.removeItem("student");
    localStorage.removeItem("hybrid_timetable");
    navigate("/login");
  };

  const navBtn = (path, label) => (
    <button
      type="button"
      className="btn ghost print-remove"
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  );

  return (
    <>
      {!hideHeaderFooter && (
        <header
          className="print-remove"
          style={{
            background: "#fff",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            }}
          >

          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <div
              style={{
                fontWeight: "800",
                fontSize: "28px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/dashboard")}
            >
              RSU Timetable System
            </div>

            {!hideNavButtons && (
              <div style={{ display: "flex", gap: 12 }}>
                {navBtn("/dashboard", "Dashboard")}
                {navBtn("/mytimetable", "My GA/SA Timetable")}
                {navBtn("/timetable", "Semester Timetable")}
                {navBtn("/schedule", "Full Semester Schedule")}
              </div>
            )}

            {isLoggedIn && (
              <div className="print-remove">
                <button className="btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="container" style={{ paddingTop: hideHeaderFooter ? 0 : 24 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/course-selection" element={<CourseSelection />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/mytimetable" element={<MyTimetable />} />
          <Route path="/timetable/download"element={<div style={{ margin: 0, padding: 0 }}> 
            <TimetableDownload noLayout /></div>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
