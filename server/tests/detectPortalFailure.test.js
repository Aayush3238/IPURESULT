import assert from "node:assert";
import { detectPortalFailure } from "../services/resultParser.js";

console.log("================================================");
console.log("Running Portal Failure Detection Unit Tests...");
console.log("================================================");

// Mock login HTML that normally is returned on login page
const loginPageHtml = `
  <html>
    <head><title>GGSIPU Login</title></head>
    <body>
      <form id="loginForm" action="/Login">
        <label>Enrollment</label><input type="text" name="username">
        <label>Password</label><input type="password" name="passwd">
        <label>Enter Captcha</label><input type="text" name="captcha">
        <img id="captchaImage" src="/CaptchaServlet">
      </form>
    </body>
  </html>
`;

// Mock page when login fails due to wrong credentials
const credentialsFailureHtml = `
  <html>
    <body>
      <div class="alert alert-danger">Invalid Username or Password</div>
      <form id="loginForm" action="/Login">
        <input type="text" name="captcha">
      </form>
    </body>
  </html>
`;

// Mock page when login fails due to wrong captcha
const captchaFailureHtml = `
  <html>
    <body>
      <font color="red">Invalid Captcha Code</font>
      <form id="loginForm" action="/Login">
        <input type="text" name="captcha">
      </form>
    </body>
  </html>
`;

// Mock page when login succeeds (redirects/lands on studenthome)
const successHtml = `
  <html>
    <head><title>Student Home</title></head>
    <body>
      <h1>Welcome Student</h1>
      <p>Enrollment: 06096203125</p>
    </body>
  </html>
`;

try {
  // 1. Success case (no login form, no error messages)
  assert.strictEqual(detectPortalFailure(successHtml, true), null, "Success page should not trigger failure");
  assert.strictEqual(detectPortalFailure(successHtml, false), null, "Success page during fetch should not trigger failure");

  // 2. Fetch requests landing on login page (Session Expired)
  const sessionErr = detectPortalFailure(loginPageHtml, false);
  assert.ok(sessionErr, "Redirection to login page during fetch should trigger an error");
  assert.strictEqual(sessionErr.code, "SESSION_EXPIRED", "Code should be SESSION_EXPIRED");

  // 3. Login failures
  const credsErr = detectPortalFailure(credentialsFailureHtml, true);
  assert.ok(credsErr, "Credentials failure should trigger an error");
  assert.strictEqual(credsErr.code, "INVALID_CREDENTIALS", "Code should be INVALID_CREDENTIALS");

  const capErr = detectPortalFailure(captchaFailureHtml, true);
  assert.ok(capErr, "Captcha failure should trigger an error");
  assert.strictEqual(capErr.code, "INVALID_CAPTCHA", "Code should be INVALID_CAPTCHA");

  console.log("✓ All Portal Failure Detection tests passed successfully!");
} catch (err) {
  console.error("✗ Tests failed:", err.message);
  process.exit(1);
}
