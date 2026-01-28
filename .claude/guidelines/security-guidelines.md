---
name: security-guidelines
description: Comprehensive security standards based on OWASP Top 10 and industry best practices, covering injection vulnerabilities, authentication, authorization, data protection, secrets management, and language-specific security patterns
version: 1.1.0
type: guideline
track_metrics: true
last_updated: 2025-12-05
---

# Security Guidelines


## Overview

These are the **MANDATORY security standards** for all code in this project. All code must be reviewed against these guidelines before merging to production.

## Quick Reference

| OWASP Category | Key Vulnerability | Critical If |
|----------------|------------------|-------------|
| A01:2021 - Broken Access Control | IDOR, Missing auth checks | User can access others' data |
| A02:2021 - Cryptographic Failures | Weak encryption, plaintext data | Passwords/PII unencrypted |
| A03:2021 - Injection | SQL, Command, XSS | User input in queries/commands |
| A04:2021 - Insecure Design | Missing security controls | No rate limiting, no validation |
| A05:2021 - Security Misconfiguration | Default configs, debug mode | Exposed admin panels, stack traces |
| A06:2021 - Vulnerable Components | Outdated dependencies | Known CVEs in dependencies |
| A07:2021 - Auth Failures | Weak passwords, no MFA | Plaintext passwords, weak hashing |
| A08:2021 - Data Integrity Failures | Insecure deserialization | Untrusted data deserialized |
| A09:2021 - Logging Failures | No logging, sensitive data logged | Failed logins not tracked |
| A10:2021 - SSRF | Unvalidated URLs | Server fetches attacker URLs |

## Priority Security Rules

| Severity | Issue Type | CVSS | Action Required |
|----------|-----------|------|----------------|
| 🔴 CRITICAL | RCE, SQL Injection, Auth Bypass, Hardcoded Secrets | 9.0-10.0 | Fix immediately |
| 🟠 HIGH | XSS, Broken Access Control, Sensitive Data Exposure | 7.0-8.9 | Fix within 24-48h |
| 🟡 MEDIUM | Missing security headers, Weak crypto, Config issues | 4.0-6.9 | Fix within 1 week |
| 🟢 LOW | Info disclosure, Missing best practices | 0.1-3.9 | Fix in next sprint |


## 1. Injection Vulnerabilities (OWASP A03:2021) 🔴 CRITICAL

### SQL Injection

```python
# ❌ CRITICAL - SQL Injection vulnerability
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)

def search_users(name):
    query = "SELECT * FROM users WHERE name = '" + name + "'"
    return db.execute(query)

# ✅ Correct - Parameterized queries
def get_user(user_id: int) -> User:
    query = "SELECT * FROM users WHERE id = ?"
    return db.execute(query, (user_id,))

def search_users(name: str) -> list[User]:
    query = "SELECT * FROM users WHERE name = ?"
    return db.execute(query, (name,))
```

**Requirements:**
- ✅ All database queries MUST use parameterized queries or prepared statements
- ✅ NEVER use string concatenation or f-strings in SQL queries
- ✅ NEVER use raw SQL without sanitization
- ✅ ORM usage must be properly configured to prevent injection

### Command Injection

```javascript
// ❌ CRITICAL - Command injection vulnerability
const { exec } = require('child_process');
app.post('/convert', (req, res) => {
  exec(`convert ${req.body.file} output.pdf`, (error, stdout) => {
    // Attacker can inject: "input.txt; rm -rf /"
  });
});

// ✅ Correct - Safe command execution
const { execFile } = require('child_process');
app.post('/convert', (req, res) => {
  // Validate filename first
  if (!/^[a-zA-Z0-9._-]+$/.test(req.body.file)) {
    return res.status(400).send('Invalid filename');
  }
  execFile('convert', [req.body.file, 'output.pdf'], (error, stdout) => {
    // Safe: arguments are properly escaped
  });
});
```

**Requirements:**
- ✅ NEVER use unsafe command execution (shell=True in Python, shell in Node.js)
- ✅ Always validate and escape command arguments
- ✅ NEVER use dangerous functions: `eval`, `exec`, `Function()`, `child_process.exec`

### XSS (Cross-Site Scripting)

```typescript
// ❌ CRITICAL - XSS vulnerability
function UserProfile({ user }) {
  return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
}

// ❌ CRITICAL - XSS in vanilla JS
document.getElementById('output').innerHTML = userInput;

// ✅ Correct - Escaped output
function UserProfile({ user }) {
  return <div>{user.bio}</div>; // React escapes by default
}

// ✅ Correct - Using textContent
document.getElementById('output').textContent = userInput;
```

**Requirements:**
- ✅ Always use proper output encoding/escaping
- ✅ NEVER use `dangerouslySetInnerHTML`, `innerHTML` with user data
- ✅ Content Security Policy (CSP) must be configured
- ✅ All user input must be sanitized before rendering

### Code Injection

```python
# ❌ CRITICAL - Code injection vulnerabilities
import pickle
user_data = pickle.loads(request.body)  # Can execute arbitrary code

result = eval(user_input)  # Never use eval with user input
exec(user_code)  # Never execute user-provided code

# ✅ Correct - Safe alternatives
import json
user_data = json.loads(request.body)  # Safe JSON parsing

# Use safe evaluation libraries or avoid dynamic execution
```

**Requirements:**
- ✅ NEVER use `pickle` with untrusted data
- ✅ NEVER use `eval` or `exec` with user input
- ✅ Use safe alternatives like `json` for data serialization

---

## 2. Authentication & Session Management (OWASP A07:2021) 🔴 CRITICAL

### Password Security

```python
# ❌ CRITICAL - Insecure password storage
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()  # MD5 is broken
password_hash = hashlib.sha1(password.encode()).hexdigest()  # SHA1 is broken

# ❌ CRITICAL - Plaintext password
user.password = password  # Never store plaintext passwords!

# ✅ Correct - Strong password hashing
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# Or use Argon2
from argon2 import PasswordHasher
ph = PasswordHasher()
password_hash = ph.hash(password)
```

**Requirements:**
- ✅ Passwords MUST be hashed with bcrypt, Argon2, or PBKDF2
- ✅ NEVER hardcode credentials
- ✅ Password complexity requirements must be enforced
- ✅ Account lockout after failed attempts is required
- ✅ Secure password reset mechanisms must be implemented
- ✅ NEVER log passwords or include them in error messages or URLs

### Session Management

```javascript
// ❌ CRITICAL - Insecure session configuration
app.use(session({
  secret: 'mysecret',  // Hardcoded secret
  cookie: {
    secure: false,     // Should be true in production
    httpOnly: false,   // Should be true to prevent XSS
    sameSite: 'none'   // Should be 'strict' or 'lax'
  }
}));

// ✅ Correct - Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,  // From environment
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000    // 1 hour expiration
  },
  rolling: true,       // Reset expiration on activity
  resave: false,
  saveUninitialized: false
}));
```

**Requirements:**
- ✅ Session tokens MUST be cryptographically random
- ✅ Proper session expiration and timeout required
- ✅ Sessions MUST be invalidated on logout
- ✅ Secure cookie flags required: `HttpOnly`, `Secure`, `SameSite`
- ✅ No session fixation vulnerabilities

### JWT Security

```typescript
// ❌ HIGH - Insecure JWT handling
const token = jwt.sign({ userId: user.id }, 'secret');  // Weak secret
localStorage.setItem('token', token);  // Vulnerable to XSS

// No expiration
const payload = jwt.verify(token, 'secret');  // No expiration check

// ✅ Correct - Secure JWT handling
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,  // Strong secret from environment
  { expiresIn: '1h', algorithm: 'HS256' }
);

// Store in HttpOnly cookie, not localStorage
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});

// Verify with proper checks
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  // Check expiration is handled by library
} catch (err) {
  // Handle invalid/expired tokens
}
```

**Requirements:**
- ✅ JWT secrets MUST come from environment variables
- ✅ Tokens MUST have expiration times
- ✅ Store tokens in HttpOnly cookies, NEVER in localStorage
- ✅ Use strong signing algorithms (HS256 minimum, RS256 preferred)

---

## 3. Authorization & Access Control (OWASP A01:2021) 🔴 CRITICAL

```python
# ❌ CRITICAL - Broken Object Level Authorization (BOLA/IDOR)
@app.route('/api/documents/<doc_id>')
def get_document(doc_id):
    doc = Document.query.get(doc_id)
    return jsonify(doc)  # No ownership check!

# ❌ CRITICAL - Missing authorization check
@app.route('/api/admin/users')
def list_users():
    users = User.query.all()
    return jsonify(users)  # No admin check!

# ✅ Correct - Proper authorization
@app.route('/api/documents/<doc_id>')
@login_required
def get_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        abort(404)

    # Check ownership
    if doc.owner_id != current_user.id:
        abort(403)  # Forbidden

    return jsonify(doc)

@app.route('/api/admin/users')
@login_required
@require_role('admin')  # Role-based access control
def list_users():
    users = User.query.all()
    return jsonify(users)
```

**Requirements:**
- ✅ RBAC (Role-Based Access Control) must be implemented
- ✅ Authorization checks required on ALL endpoints
- ✅ NEVER allow IDOR vulnerabilities (users accessing others' resources)
- ✅ Prevent horizontal/vertical privilege escalation
- ✅ Function-level access control required

---

## 4. Sensitive Data Exposure (OWASP A02:2021) 🔴 CRITICAL

### Data in Transit

```javascript
// ❌ CRITICAL - Using HTTP instead of HTTPS
const server = http.createServer(app);

// ❌ CRITICAL - Sensitive data in GET parameters
fetch(`/api/reset-password?token=${resetToken}&password=${newPassword}`);

// ✅ Correct - HTTPS enforced
const server = https.createServer({
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app);

// Force HTTPS redirect
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// ✅ Correct - POST with body
fetch('/api/reset-password', {
  method: 'POST',
  body: JSON.stringify({ token: resetToken, password: newPassword }),
  headers: { 'Content-Type': 'application/json' }
});
```

### Data at Rest

```python
# ❌ CRITICAL - Sensitive data in plaintext
user.ssn = request.form['ssn']  # Stored as plaintext
user.credit_card = request.form['card']  # Stored as plaintext

# ✅ Correct - Encrypt sensitive data
from cryptography.fernet import Fernet

cipher = Fernet(encryption_key)
user.ssn_encrypted = cipher.encrypt(request.form['ssn'].encode())
user.credit_card_encrypted = cipher.encrypt(request.form['card'].encode())
```

### Data Leakage

```python
# ❌ CRITICAL - Sensitive data in logs
logger.info(f"User {user.email} logged in with password {password}")
logger.debug(f"Credit card: {card_number}")

# ❌ HIGH - Verbose error messages
try:
    process_payment(card)
except Exception as e:
    return f"Error: {str(e)}", 500  # May expose stack traces

# ✅ Correct - Safe logging
logger.info(f"User {user.id} logged in successfully")

# ✅ Correct - Generic error messages
try:
    process_payment(card)
except PaymentError as e:
    logger.error(f"Payment failed for user {user.id}: {str(e)}")
    return {"error": "Payment processing failed"}, 500
```

**Requirements:**
- ✅ HTTPS MUST be enforced in production
- ✅ Sensitive data MUST be encrypted at rest
- ✅ NEVER log sensitive data (passwords, tokens, credit cards)
- ✅ NEVER include sensitive data in URLs or error messages
- ✅ TLS 1.2+ with strong ciphers required
- ✅ NEVER commit sensitive data to version control

---

## 5. Secrets Management 🔴 CRITICAL

```python
# ❌ CRITICAL - Hardcoded secrets
API_KEY = "sk-1234567890abcdef"
DATABASE_URL = "postgresql://user:password@localhost/db"
SECRET_KEY = "mysecretkey"

# ❌ CRITICAL - Secrets in code comments
# TODO: Change API key: sk-test-1234567890

# ✅ Correct - Use environment variables
import os

API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY environment variable not set")

DATABASE_URL = os.environ.get("DATABASE_URL")
SECRET_KEY = os.environ.get("SECRET_KEY")

# ✅ Correct - Use secret management service
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://myvault.vault.azure.net/", credential=credential)
api_key = client.get_secret("api-key").value
```

**Requirements:**
- ✅ NEVER hardcode API keys, passwords, or tokens
- ✅ Environment variables or secret management services MUST be used
- ✅ NEVER commit secrets to version control (.env files, keys)
- ✅ NEVER log secrets or include them in error messages
- ✅ Secret rotation mechanisms must be in place

---

## 6. Security Misconfiguration (OWASP A05:2021) 🟠 HIGH

```javascript
// ❌ HIGH - CORS misconfiguration
app.use(cors({
  origin: '*',  // Allows any origin
  credentials: true
}));

// ❌ HIGH - Missing security headers
// No helmet.js or security headers

// ❌ HIGH - Debug mode in production
app.set('env', 'development');
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

// ✅ Correct - Proper CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Correct - Security headers
const helmet = require('helmet');
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));

// ✅ Correct - Production mode
if (process.env.NODE_ENV === 'production') {
  app.set('env', 'production');
  // Generic error handler
  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
}
```

**Requirements:**
- ✅ Secure default configurations required
- ✅ NEVER enable debug mode in production
- ✅ Security headers MUST be set (CSP, X-Frame-Options, HSTS, X-Content-Type-Options)
- ✅ CORS must NOT be overly permissive
- ✅ NEVER expose admin interfaces
- ✅ Error handlers must NOT expose stack traces in production

---

## 7. File Upload Security 🟠 HIGH

```python
# ❌ HIGH - Insecure file upload
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    file.save(f'/var/www/uploads/{file.filename}')  # Path traversal!
    return 'File uploaded'

# ✅ Correct - Secure file upload
import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file', 400

    file = request.files['file']

    # Validate file
    if not file or not allowed_file(file.filename):
        return 'Invalid file type', 400

    # Check file size
    if len(file.read()) > MAX_FILE_SIZE:
        return 'File too large', 400
    file.seek(0)

    # Secure filename and save outside web root
    filename = secure_filename(file.filename)
    filepath = os.path.join('/secure/uploads', filename)
    file.save(filepath)

    # TODO: Add virus scanning here

    return 'File uploaded successfully'
```

**Requirements:**
- ✅ File type validation required (content, not just extension)
- ✅ File size limits MUST be enforced
- ✅ Files MUST be stored outside web root
- ✅ Malware scanning recommended for production
- ✅ Filenames MUST be sanitized (prevent path traversal)
- ✅ Use unique filenames to prevent overwriting

---

## 8. Rate Limiting & DoS Protection 🟡 MEDIUM

```javascript
// ❌ MEDIUM - No rate limiting
app.post('/api/login', async (req, res) => {
  // Unlimited login attempts!
});

// ✅ Correct - Rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // Protected with rate limiting
});

app.use('/api/', apiLimiter);
```

**Requirements:**
- ✅ Rate limiting MUST be implemented on authentication endpoints
- ✅ Rate limiting MUST be implemented on API endpoints
- ✅ Brute force protection required
- ✅ Request size limits must be configured
- ✅ Timeout configurations required

---

## 9. Logging & Monitoring (OWASP A09:2021) 🟡 MEDIUM

```python
# ❌ MEDIUM - Insufficient logging
@app.route('/api/login', methods=['POST'])
def login():
    user = User.query.filter_by(email=request.json['email']).first()
    if user and user.check_password(request.json['password']):
        return jsonify({'token': generate_token(user)})
    return 'Invalid credentials', 401  # No logging of failed attempts

# ✅ Correct - Proper security logging
import logging

logger = logging.getLogger(__name__)

@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email')

    logger.info(f"Login attempt for {email} from IP {request.remote_addr}")

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(request.json['password']):
        logger.info(f"Successful login for user {user.id}")
        return jsonify({'token': generate_token(user)})

    logger.warning(f"Failed login attempt for {email} from IP {request.remote_addr}")
    return 'Invalid credentials', 401
```

**Requirements:**
- ✅ Security events MUST be logged (login, failures, access violations)
- ✅ Logs MUST contain sufficient detail for investigation
- ✅ NEVER log sensitive data (passwords, credit cards, tokens)
- ✅ Log integrity protection recommended
- ✅ Alerting on suspicious activities required

---

## Language-Specific Security Patterns

### TypeScript/JavaScript/Node.js

```javascript
// ❌ Prototype pollution
let obj = {};
obj[userInput] = value;  // Can pollute Object.prototype

// ❌ ReDoS (Regular expression Denial of Service)
const regex = /(a+)+$/;
regex.test(userInput);  // Can cause CPU spike

// ❌ Insecure randomness for security
const token = Math.random().toString(36);  // Predictable!

// ✅ Use crypto for security-sensitive operations
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
```

**Requirements:**
- ✅ NEVER allow prototype pollution
- ✅ Test regex patterns for ReDoS vulnerabilities
- ✅ Use `crypto` module for security tokens, NEVER `Math.random()`

### Python

```python
# ❌ Unsafe deserialization
import pickle
data = pickle.loads(user_input)  # Can execute code

# ❌ YAML deserialization
import yaml
data = yaml.load(user_input)  # Unsafe!

# ✅ Safe alternatives
import json
data = json.loads(user_input)

import yaml
data = yaml.safe_load(user_input)

# ❌ Insecure randomness
import random
token = random.randint(1000, 9999)  # Predictable!

# ✅ Use secrets module
import secrets
token = secrets.token_hex(16)
```

**Requirements:**
- ✅ NEVER use `pickle` with untrusted data
- ✅ Use `yaml.safe_load()`, NEVER `yaml.load()`
- ✅ Use `secrets` module for tokens, NEVER `random`

---

## Security Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **CWE Top 25:** https://cwe.mitre.org/top25/
- **SANS Top 25:** https://www.sans.org/top25-software-errors/
- **CVSS Calculator:** https://www.first.org/cvss/calculator/
- **OWASP Cheat Sheets:** https://cheatsheetseries.owasp.org/

---

## Project-Specific Customization

**Add your organization's security requirements below:**

### Compliance Requirements
- [ ] GDPR compliance required
- [ ] HIPAA compliance required
- [ ] PCI-DSS compliance required
- [ ] SOC 2 compliance required

### Approved Technologies
- **Authentication:** [Add approved methods]
- **Encryption:** [Add approved algorithms/libraries]
- **Third-party services:** [List approved vendors]

### Custom Security Policies
[Add your organization's specific security policies here]

---

**Remember:** Security is not optional. When in doubt, err on the side of caution and flag potential issues.

---

## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `shared/metrics-instructions.md` for complete tracking instructions and format.