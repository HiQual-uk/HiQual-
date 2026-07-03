/* =========================================================
   certificate.js — Certificate Verification logic
   ---------------------------------------------------------
   IMPORTANT: The data below is SAMPLE data only, so you can
   test how the page looks and works right now.
   In a later step, we will replace "sampleCertificates" with
   a live connection to your Google Sheet — nothing else on
   this page will need to change.

   SheetDB column sequence (match this order in your Google Sheet):
   Certificate Number | Student Name | Father Name | Course Name |
   Issue Date | Date of Birth | Instructor | Status
   ========================================================= */
const sampleCertificates = [
  {
    certNo: "HQ-2026-00123",
    name: "Ahmed Raza",
    father: "Muhammad Raza",
    course: "NEBOSH IGC",
    issueDate: "2026-05-10",
    dob: "2004-12-17",
    instructor: "John Hang",
    status: "Valid"
  },
  {
    certNo: "HQ-2026-00099",
    name: "Sara Khan",
    father: "Imran Khan",
    course: "IOSH Managing Safely",
    issueDate: "2023-01-15",
    dob: "2004-12-17",
    instructor: "John Hang",
    status: "Expired"
  }
];

function formatDate(isoDate) {
  if (!isoDate) return "N/A";
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showEmpty() {
  document.getElementById('resultEmpty').style.display = 'block';
  document.getElementById('resultNotFound').style.display = 'none';
  document.getElementById('resultFound').style.display = 'none';
}

function showNotFound() {
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultNotFound').style.display = 'block';
  document.getElementById('resultFound').style.display = 'none';
}

function showFound(cert) {
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultNotFound').style.display = 'none';
  document.getElementById('resultFound').style.display = 'block';

  document.getElementById('valName').textContent = cert.name;
  document.getElementById('valFather').textContent = cert.father || "N/A";
  document.getElementById('valCourse').textContent = cert.course;
  document.getElementById('valCertNo').textContent = cert.certNo;
  document.getElementById('valIssue').textContent = formatDate(cert.issueDate);
  document.getElementById('valDob').textContent = cert.dob ? formatDate(cert.dob) : "N/A";
  document.getElementById('valInstructor').textContent = cert.instructor;

  document.getElementById('stName').textContent = cert.name;
  document.getElementById('stName2').textContent = cert.name;
  document.getElementById('stCourse').textContent = cert.course;

  const badge = document.getElementById('statusBadge');
  if (cert.status === "Valid") {
    badge.className = "status-badge status-valid";
    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Valid';
  } else {
    badge.className = "status-badge status-expired";
    badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Expired';
  }
}

function verifyCertificate(certNo) {
  const cleaned = certNo.trim().toUpperCase();
  if (!cleaned) return;

  const match = sampleCertificates.find(c => c.certNo.toUpperCase() === cleaned);
  if (match) {
    showFound(match);
  } else {
    showNotFound();
  }
}

// ---------- Button click ----------
const verifyBtn = document.getElementById('verifyBtn');
const certInput = document.getElementById('certInput');

if (verifyBtn && certInput) {
  verifyBtn.addEventListener('click', () => verifyCertificate(certInput.value));
  certInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyCertificate(certInput.value);
  });
}

// ---------- Auto-verify if opened via QR code link ----------
// A QR code will link to: certificate.html?cert=HQ-2026-00123
const urlParams = new URLSearchParams(window.location.search);
const certFromQR = urlParams.get('cert');
if (certFromQR) {
  certInput.value = certFromQR;
  verifyCertificate(certFromQR);
}
