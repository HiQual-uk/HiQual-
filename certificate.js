/* =========================================================
   certificate.js — Certificate Verification logic
   ---------------------------------------------------------
   This page is connected LIVE to your Google Sheet through
   SheetDB. Any student you add in the Sheet becomes instantly
   searchable here — no coding or re-upload needed.
   ========================================================= */

// Your SheetDB API link (connected to "HiQual Certificates" Google Sheet)
const SHEETDB_API_URL = "https://sheetdb.io/api/v1/nxwxkezee0ivo";

function formatDate(isoDate) {
  if (!isoDate) return "N/A";
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showEmpty() {
  document.getElementById('resultEmpty').style.display = 'block';
  document.getElementById('resultNotFound').style.display = 'none';
  document.getElementById('resultFound').style.display = 'none';
  document.getElementById('resultEmpty').innerHTML =
    '<i class="fa-solid fa-file-shield"></i><p>Certificate details will appear here after verification.</p>';
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
  document.getElementById('valExpiry').textContent = cert.expiryDate ? formatDate(cert.expiryDate) : "No Expiry";
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

function showLoading() {
  document.getElementById('resultEmpty').style.display = 'block';
  document.getElementById('resultNotFound').style.display = 'none';
  document.getElementById('resultFound').style.display = 'none';
  document.getElementById('resultEmpty').innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i><p>Checking certificate, please wait...</p>';
}

// Works out Valid / Expired automatically by comparing ExpiryDate to today.
// If ExpiryDate is empty, the certificate is treated as lifetime valid.
function calculateStatus(expiryDate) {
  if (!expiryDate || expiryDate.trim() === "") return "Valid";
  const today = new Date();
  const expiry = new Date(expiryDate);
  return today > expiry ? "Expired" : "Valid";
}

async function verifyCertificate(certNo) {
  const cleaned = certNo.trim().toUpperCase();
  if (!cleaned) return;

  showLoading();

  try {
    // Ask SheetDB to search the sheet for a matching CertificateNumber
    const url = `${SHEETDB_API_URL}/search?CertificateNumber=${encodeURIComponent(cleaned)}`;
    const response = await fetch(url);
    const rows = await response.json();

    if (rows && rows.length > 0) {
      const row = rows[0];
      const cert = {
        certNo: row.CertificateNumber,
        name: row.StudentName,
        father: row.FatherName,
        course: row.CourseName,
        issueDate: row.IssueDate,
        expiryDate: row.ExpiryDate,
        instructor: row.Instructor,
        status: calculateStatus(row.ExpiryDate)
      };
      showFound(cert);
    } else {
      showNotFound();
    }
  } catch (error) {
    console.error("Verification error:", error);
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
