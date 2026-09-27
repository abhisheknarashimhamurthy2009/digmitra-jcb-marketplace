import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const projectDir = "C:\\Users\\Abhishek N\\Desktop\\site cleaning app\\jcb-booking-marketplace-223";
const desktopDir = "C:\\Users\\Abhishek N\\Desktop";
const artifactDir = "C:\\Users\\Abhishek N\\.gemini\\antigravity\brain\\87421d64-dd27-40d7-9a59-e499a9bfeda9";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigMitra JCB App — Server Manual Startup & Management Guide</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-banner {
      background: linear-gradient(135deg, #0b3d91 0%, #062b66 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #ffb400;
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.3px;
      color: #ffffff;
    }
    .header-title p {
      font-size: 12px;
      color: #cbd5e1;
      margin-top: 4px;
      font-weight: 500;
    }
    .header-badge {
      background: #ffb400;
      color: #0b3d91;
      font-weight: 900;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: right;
    }
    .quick-summary {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 22px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .summary-value {
      font-size: 13px;
      font-weight: 800;
      color: #0b3d91;
      margin-top: 2px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .step-card {
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      margin-bottom: 16px;
      overflow: hidden;
      page-break-inside: avoid;
      background: #ffffff;
    }
    .step-header {
      background: #f1f5f9;
      padding: 10px 16px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .step-number {
      background: #0b3d91;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 12px;
      shrink-0;
    }
    .step-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }
    .step-body {
      padding: 14px 16px;
    }
    .step-body p {
      font-size: 12.5px;
      color: #334155;
      margin-bottom: 8px;
    }
    .code-box {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 700;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-left: 4px solid #ffb400;
    }
    .code-box code {
      color: #38bdf8;
    }
    .code-comment {
      color: #94a3b8;
      font-size: 10px;
      font-style: italic;
    }
    .tip-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 8px 0;
      font-size: 11.5px;
      color: #166534;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .tip-box strong {
      color: #14532d;
    }
    .warn-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 8px 0;
      font-size: 11.5px;
      color: #92400e;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .table-container {
      margin-top: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 800;
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .url-badge {
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: ui-monospace, monospace;
      font-size: 11.5px;
      display: inline-block;
      border: 1px solid #bfdbfe;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Top Header Banner -->
  <div class="header-banner">
    <div class="header-title">
      <h1>DigMitra JCB Site Cleaning App</h1>
      <p>Terminal Server Manual Startup & Execution Guide</p>
    </div>
    <div class="header-badge">
      Port 5050 • Offline Guide
    </div>
  </div>

  <!-- Quick Reference Strip -->
  <div class="quick-summary">
    <div class="summary-item">
      <span class="summary-label">Project Directory</span>
      <span class="summary-value">jcb-booking-marketplace-223</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Default Port</span>
      <span class="summary-value">5050 (host: true)</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Local Access URL</span>
      <span class="summary-value">http://localhost:5050</span>
    </div>
  </div>

  <!-- Step 1: Open Terminal -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">1</div>
      <div class="step-title">Open Terminal (PowerShell / Command Prompt)</div>
    </div>
    <div class="step-body">
      <p>Open any terminal on your Windows machine:</p>
      <ul style="margin-left: 20px; font-size: 12px; color: #334155; margin-bottom: 8px;">
        <li>Press <kbd style="background:#e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight:700;">Win</kbd> + <kbd style="background:#e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight:700;">R</kbd>, type <strong>powershell</strong> or <strong>cmd</strong>, and press <strong>Enter</strong>.</li>
        <li><em>Alternative:</em> Navigate to the folder in Windows File Explorer, hold <kbd style="background:#e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight:700;">Shift</kbd> and right-click on empty space, then select <strong>"Open in Terminal"</strong>.</li>
      </ul>
    </div>
  </div>

  <!-- Step 2: Navigate to Directory -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">2</div>
      <div class="step-title">Navigate to Project Folder</div>
    </div>
    <div class="step-body">
      <p>Copy and run the following command in your terminal to go to the app directory:</p>
      <div class="code-box">
        <code>cd "C:\\Users\\Abhishek N\\Desktop\\site cleaning app\\jcb-booking-marketplace-223"</code>
        <span class="code-comment">Navigate</span>
      </div>
      <div class="tip-box">
        <span>💡</span>
        <span><strong>Tip:</strong> You can verify your current folder by typing <code>pwd</code> and pressing Enter.</span>
      </div>
    </div>
  </div>

  <!-- Step 3: Start Server -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">3</div>
      <div class="step-title">Start the Development Server</div>
    </div>
    <div class="step-body">
      <p>Run any <strong>one</strong> of these commands to launch the server:</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Command Option</th>
              <th>Terminal Command</th>
              <th>Speed / Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Option A (Recommended)</strong></td>
              <td><code>pnpm dev</code></td>
              <td>Fastest native package runner</td>
            </tr>
            <tr>
              <td><strong>Option B (NPM)</strong></td>
              <td><code>npm run dev</code></td>
              <td>Standard Node package manager</td>
            </tr>
            <tr>
              <td><strong>Option C (Vite Direct)</strong></td>
              <td><code>npx vite</code></td>
              <td>Direct bundler execution</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="margin-top: 10px;">When successful, the terminal will display:</p>
      <div class="code-box" style="border-left-color: #10b981;">
        <code style="color: #4ade80;">
          VITE v8.1.0 ready in 1200 ms<br/>
          ➜ Local: http://localhost:5050/<br/>
          ➜ Network: http://192.168.29.59:5050/
        </code>
        <span class="code-comment">Server Active</span>
      </div>
    </div>
  </div>

  <!-- Step 4: Access in Browser & Mobile -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">4</div>
      <div class="step-title">Access the Live Application</div>
    </div>
    <div class="step-body">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Device</th>
              <th>URL / Address</th>
              <th>Requirements</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Computer / Laptop</strong></td>
              <td><span class="url-badge">http://localhost:5050</span></td>
              <td>Any browser (Chrome, Edge, Firefox)</td>
            </tr>
            <tr>
              <td><strong>Mobile Phone / Tablet</strong></td>
              <td><span class="url-badge">http://192.168.29.59:5050</span></td>
              <td>Connected to the same Wi-Fi network</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Step 5: How to Switch Off / Stop -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">5</div>
      <div class="step-title">How to Switch OFF / Stop the Server</div>
    </div>
    <div class="step-body">
      <p>To safely terminate and switch off the server at any time:</p>
      <ul style="margin-left: 20px; font-size: 12px; color: #334155; margin-bottom: 8px;">
        <li>Focus your terminal window where the server is running.</li>
        <li>Press <kbd style="background:#e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight:700;">Ctrl</kbd> + <kbd style="background:#e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight:700;">C</kbd>.</li>
        <li>If prompted with <code>Terminate batch job (Y/N)?</code>, type <strong>Y</strong> and hit <strong>Enter</strong>.</li>
      </ul>
    </div>
  </div>

  <!-- Step 6: Troubleshooting Port 5050 -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-number">6</div>
      <div class="step-title">Troubleshooting: What if Port 5050 is Busy?</div>
    </div>
    <div class="step-body">
      <p>If you see <em>"Port 5050 is in use"</em>, run this single PowerShell command to immediately release port 5050:</p>
      <div class="code-box" style="border-left-color: #ef4444;">
        <code style="color: #fca5a5;">Stop-Process -Id (Get-NetTCPConnection -LocalPort 5050 -ErrorAction SilentlyContinue).OwningProcess -Force</code>
        <span class="code-comment">Kill Port 5050</span>
      </div>
      <p style="margin-top: 6px;">Or using npm:</p>
      <div class="code-box">
        <code>npx kill-port 5050</code>
        <span class="code-comment">Free Port</span>
      </div>
      <p style="margin-top: 6px;">After killing the busy process, run <code>pnpm dev</code> or <code>npm run dev</code> again.</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>DigMitra Platform • Site Cleaning & JCB Booking Marketplace</span>
    <span>Generated: September 2026 • Windows 11</span>
  </div>

</body>
</html>
`;

// Save the HTML version in public folder
const htmlPath = path.join(projectDir, "public", "server-startup-guide.html");
fs.writeFileSync(htmlPath, htmlContent, "utf-8");
console.log("Written HTML to:", htmlPath);

// Target PDF destinations
const projectPdf = path.join(projectDir, "SERVER-STARTUP-GUIDE.pdf");
const publicPdf = path.join(projectDir, "public", "SERVER-STARTUP-GUIDE.pdf");
const desktopPdf = path.join(desktopDir, "SERVER-STARTUP-GUIDE.pdf");
const artifactPdf = path.join(artifactDir, "SERVER-STARTUP-GUIDE.pdf");

// Execute Edge headless print to PDF
try {
  const normalizedHtml = "file:///" + htmlPath.replace(/\\/g, "/");
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${projectPdf}" "${normalizedHtml}"`;
  console.log("Running PDF generation command...");
  execSync(cmd, { stdio: "inherit" });
  
  if (fs.existsSync(projectPdf)) {
    console.log("Successfully generated project PDF:", projectPdf);
    // Copy to other convenient locations
    fs.copyFileSync(projectPdf, publicPdf);
    console.log("Copied to public folder (accessible via browser):", publicPdf);
    fs.copyFileSync(projectPdf, desktopPdf);
    console.log("Copied to Desktop for direct opening:", desktopPdf);
    try {
      fs.copyFileSync(projectPdf, artifactPdf);
      console.log("Copied to artifacts directory:", artifactPdf);
    } catch (e) {
      console.warn("Artifact copy warning:", e.message);
    }
  } else {
    console.error("PDF file was not created at expected location:", projectPdf);
  }
} catch (err) {
  console.error("Error executing Edge print-to-pdf:", err);
}
