import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ✅ adjust path if needed
import rsuLogo from "../assets/rsu-logo-h.png";

export default function TimetableDownload() {
  const [plan, setPlan] = useState([]);
  const pdfRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("hybrid_timetable");
    if (saved) {
      const obj = JSON.parse(saved);
      if (obj && Array.isArray(obj.rows)) {
        setPlan(obj.rows);
      }
    }
  }, []);

  const downloadPDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("RSU_Timetable.pdf");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* ✅ PDF AREA */}
      <div ref={pdfRef} style={{ width: "100%", margin: "0 auto" }}>

        {/* ===== HEADING WITH LOGO ===== */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: 0 }}>RSU Semester Timetable</h2>

          <img
            src={rsuLogo}
            alt="RSU Logo"
            style={{
              height: "42px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* ===== TABLE ===== */}
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
          }}
        >
          <thead>
            <tr style={{ background: "#eef1ff", height: "40px" }}>
              <th>Course Code</th>
              <th>Section</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Day</th>
              <th>Time Slot</th>
              <th>Room</th>
            </tr>
          </thead>

          <tbody>
            {plan.map((r, i) => {
              const start = r.start_time?.slice(0, 5);
              const end = r.end_time?.slice(0, 5);

              return (
                <tr
                  key={i}
                  style={{
                    background: "white",
                    height: "42px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <td style={{ padding: "6px" }}>{r.course_code}</td>
                  <td style={{ padding: "6px" }}>{r.section_code}</td>
                  <td style={{ padding: "6px" }}>{r.course_name}</td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    {r.credits}
                  </td>
                  <td style={{ padding: "6px" }}>{r.day}</td>
                  <td style={{ padding: "6px" }}>
                    {start}–{end}
                  </td>
                  <td style={{ padding: "6px" }}>{r.room}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== BUTTON (NOT IN PDF) ===== */}
      <div
        style={{ textAlign: "center", marginTop: "25px" }}
        className="print-remove"
      >
        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            background: "#1e40af",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
