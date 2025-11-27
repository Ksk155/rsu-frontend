// frontend/src/lib/apiClient.js
const API_BASE = "https://rsu-backend.onrender.com";//"http://localhost:4000"; // backend base; callers include `/api/...`

// Generic GET
export async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (err) {
    console.error("GET error:", err);
    return { error: "Network GET error" };
  }
}

// Generic POST
export async function apiPost(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return await res.json();
  } catch (err) {
    console.error("POST error:", err);
    return { error: "Network POST error" };
  }
}

// Generic PUT
export async function apiPut(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return await res.json();
  } catch (err) {
    console.error("PUT error:", err);
    return { error: "Network PUT error" };
  }
}

// Used by App.jsx / Dashboard.jsx
export function logout() {
  localStorage.removeItem("student");
}
