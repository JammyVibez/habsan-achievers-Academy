import type { ReportCardPayload } from '@/lib/report-card';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReportCardHtml(data: ReportCardPayload): string {
  const rows = data.results
    .map(
      (r) => `
          <tr>
            <td>${esc(r.subject)}</td>
            <td>${esc(String(r.ca1))}</td>
            <td>${esc(String(r.ca2))}</td>
            <td>${esc(String(r.exam))}</td>
            <td>${esc(String(r.total))}</td>
            <td>${esc(r.grade)}</td>
            <td>${esc(r.comment)}</td>
          </tr>`,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Report Card</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .school-name { font-size: 24px; font-weight: bold; color: #006600; }
        .report-title { font-size: 18px; margin-top: 10px; }
        .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-item { border: 1px solid #ddd; padding: 10px; }
        .label { font-weight: bold; color: #006600; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #006600; color: white; }
        .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
        .summary-item { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .attendance { margin: 20px 0; }
        .signature-line { margin-top: 30px; display: flex; justify-content: space-around; }
        .signature { text-align: center; }
        .signature-space { border-top: 1px solid #000; width: 150px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">HABSAN ACHIEVERS ACADEMY</div>
        <div class="report-title">ACADEMIC REPORT CARD</div>
        <div>Session: ${esc(data.academicSession)} | Term: ${esc(data.term)}</div>
      </div>

      <div class="student-info">
        <div class="info-item">
          <span class="label">Student Name:</span> ${esc(data.studentName)}
        </div>
        <div class="info-item">
          <span class="label">Admission Number:</span> ${esc(data.admissionNumber)}
        </div>
        <div class="info-item">
          <span class="label">Class:</span> ${esc(data.className)}
        </div>
        <div class="info-item">
          <span class="label">Position:</span> ${esc(data.position)}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>CA1</th>
            <th>CA2</th>
            <th>Exam</th>
            <th>Total</th>
            <th>Grade</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>${rows}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-item">
          <div><strong>GPA</strong></div>
          <div style="font-size: 24px; color: #006600; margin-top: 10px;">${esc(String(data.gpa))}</div>
        </div>
        <div class="summary-item">
          <div><strong>Overall Grade</strong></div>
          <div style="font-size: 24px; color: #006600; margin-top: 10px;">${esc(data.overallGrade)}</div>
        </div>
        <div class="summary-item">
          <div><strong>Conduct</strong></div>
          <div style="font-size: 24px; color: #006600; margin-top: 10px;">${esc(data.conduct)}</div>
        </div>
      </div>

      <div class="attendance">
        <strong>Attendance</strong>
        <p>Days Present: ${data.attendance.daysPresent} | Days Absent: ${data.attendance.daysAbsent} | Days Late: ${data.attendance.daysLate}</p>
      </div>

      <div>
        <strong>Class Teacher's Comment:</strong>
        <p>${esc(data.classTeacherComment)}</p>
      </div>

      <div>
        <strong>General Comment:</strong>
        <p>${esc(data.comments)}</p>
      </div>

      <div class="signature-line">
        <div class="signature">
          <div class="signature-space"></div>
          <p>Class Teacher</p>
        </div>
        <div class="signature">
          <div class="signature-space"></div>
          <p>Principal</p>
        </div>
      </div>
    </body>
    </html>
    `;
}
