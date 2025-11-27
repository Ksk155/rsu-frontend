// src/lib/timetable.js

// naive conflict detector: conflicts when same day & overlapping time ranges
export function detectConflicts(rows){
  const conflicts = [];
  const dayMap = {};
  (rows||[]).forEach(r=>{
    if(!r.day || !r.start_time || !r.end_time) return;
    const key = r.day;
    dayMap[key] = dayMap[key] || [];
    dayMap[key].push(r);
  });
  Object.entries(dayMap).forEach(([day, arr])=>{
    arr.sort((a,b)=> (a.start_time||"").localeCompare(b.start_time||""));
    for(let i=0;i<arr.length-1;i++){
      const A = arr[i], B = arr[i+1];
      if(A.end_time && B.start_time && A.end_time > B.start_time){
        conflicts.push(`${day}: ${A.course_code} overlaps ${B.course_code}`);
      }
    }
  });
  return conflicts;
}

// minimal ICS exporter using rows (requires fields day, start_time, end_time)
export function exportICS(rows, calendarName="Timetable"){
  const dtstamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";

  const dayIdx = {Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:0};
  const nextDateForDay = (dow)=>{
    const now = new Date();
    const cur = now.getDay();
    const target = dayIdx[dow] ?? 1; // default Mon
    const diff = (target - cur + 7) % 7;
    const d = new Date(now); d.setDate(now.getDate()+diff);
    return d;
  };

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RSU Timetable//EN",
    `X-WR-CALNAME:${calendarName}`
  ];

  (rows||[]).forEach((r, idx)=>{
    const start = r.start_time || "09:00";
    const end   = r.end_time   || "10:00";
    const base  = nextDateForDay(r.day || "Mon");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const dtStart = new Date(base); dtStart.setHours(sh, sm, 0, 0);
    const dtEnd   = new Date(base); dtEnd.setHours(eh, em, 0, 0);

    const fmt = (d)=> d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${dtstamp}-${idx}@rsu`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${fmt(dtStart)}`,
      `DTEND:${fmt(dtEnd)}`,
      `SUMMARY:${r.course_code} ${r.course_name||""}`.trim(),
      `LOCATION:${r.room||""}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "timetable.ics"; a.click();
  URL.revokeObjectURL(url);
}
