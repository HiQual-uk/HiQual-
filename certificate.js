/* =========================================================
   certificate.js — Certificate Verification logic
   LIVE DATA: connects to Google Sheet via SheetDB.
   Sheet columns: Certificate Number | Student Name | Father Name |
   Course Name | Issue Date | Date of Birth | Instructor | Status
   ========================================================= */
const SHEETDB_API_URL = "https://sheetdb.io/api/v1/nxwxkezee0ivo";

function mapRowToCertificate(row) {
  return {
    certNo: row["Certificate Number"] || "",
    name: row["Student Name"] || "",
    father: row["Father Name"] || "",
    course: row["Course Name"] || "",
    issueDate: row["Issue Date"] || "",
    dob: row["Date of Birth"] || "",
    instructor: row["Instructor"] || "",
    status: row["Status"] || ""
  };
}

function formatDate(isoDate) {
  if (!isoDate) return "N/A";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
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

  const badge = document.getElementById('statusBadge');
  if (cert.status === "Valid") {
    badge.className = "status-badge status-valid";
    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Valid';
  } else {
    badge.className = "status-badge status-expired";
    badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Expired';
  }
}

const verifyBtn = document.getElementById('verifyBtn');
const certInput = document.getElementById('certInput');

function showLoading() {
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultNotFound').style.display = 'none';
  document.getElementById('resultFound').style.display = 'none';
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.dataset.originalText = verifyBtn.dataset.originalText || verifyBtn.innerHTML;
    verifyBtn.innerHTML = 'Checking...';
  }
}

function resetButton() {
  if (verifyBtn) {
    verifyBtn.disabled = false;
    if (verifyBtn.dataset.originalText) {
      verifyBtn.innerHTML = verifyBtn.dataset.originalText;
    }
  }
}

async function verifyCertificate(certNo) {
  const cleaned = certNo.trim().toUpperCase();
  if (!cleaned) return;

  showLoading();

  try {
    const url = SHEETDB_API_URL + "/search?Certificate%20Number=" + encodeURIComponent(cleaned);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const rows = await response.json();
    let matchRow = rows && rows.length > 0 ? rows[0] : null;

    if (!matchRow) {
      const allResponse = await fetch(SHEETDB_API_URL);
      const allRows = await allResponse.json();
      matchRow = allRows.find(function(r) {
        return (r["Certificate Number"] || "").trim().toUpperCase() === cleaned;
      });
    }

    resetButton();

    if (matchRow) {
      showFound(mapRowToCertificate(matchRow));
    } else {
      showNotFound();
    }
  } catch (err) {
    console.error("Error fetching certificate data:", err);
    resetButton();
    showNotFound();
  }
}

if (verifyBtn && certInput) {
  verifyBtn.addEventListener('click', () => verifyCertificate(certInput.value));
  certInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyCertificate(certInput.value);
  });
}

const urlParams = new URLSearchParams(window.location.search);
const certFromQR = urlParams.get('cert');
if (certFromQR) {
  certInput.value = certFromQR;
  verifyCertificate(certFromQR);
}
