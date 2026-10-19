/* =========================================================
   COMPUTER LABORATORY MANAGEMENT SYSTEM
   AUTHENTICATION
   - salted + stretched SHA-256 password hashes
   - sign in with lockout after repeated failures
   - forgot password → reset request to the admin
   - admin-issued temporary passwords
   - change own password, idle auto-logout
   Loaded after app.js, before ui.js.

   NOTE: this is a browser-only app (no server), so all
   accounts live in this browser's localStorage. Hashing
   keeps passwords from being readable, but anyone with
   access to this computer's browser data could still
   tamper with it. Use a real backend for production.
   ========================================================= */


const SESSION_KEY = "computerLaboratorySession";
const ATTEMPTS_KEY = "computerLaboratoryLoginAttempts";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;
const HASH_ROUNDS = 1000;
const IDLE_MINUTES = 30;

let session = loadSession();
let lastActivity = Date.now();


/* =========================================================
   SHA-256 (synchronous, works on file:// too)
   ========================================================= */

const SHA_K = [];
const SHA_H0 = [];

(function initShaConstants() {

    const frac = x => (x - Math.floor(x)) * 4294967296 | 0;
    let n = 2;

    while (SHA_K.length < 64) {

        let prime = true;

        for (let f = 2; f * f <= n; f++) {
            if (n % f === 0) {
                prime = false;
                break;
            }
        }

        if (prime) {
            if (SHA_H0.length < 8) {
                SHA_H0.push(frac(Math.pow(n, 1 / 2)));
            }
            SHA_K.push(frac(Math.pow(n, 1 / 3)));
        }

        n++;

    }

})();


function sha256(message) {

    const bytes = Array.from(new TextEncoder().encode(message));
    const bitLength = bytes.length * 8;
    const rotr = (x, r) => (x >>> r) | (x << (32 - r));
    const H = SHA_H0.slice();
    const W = new Array(64);

    bytes.push(0x80);

    while (bytes.length % 64 !== 56) {
        bytes.push(0);
    }

    const high = Math.floor(bitLength / 4294967296);

    for (let i = 3; i >= 0; i--) bytes.push((high >>> (i * 8)) & 255);
    for (let i = 3; i >= 0; i--) bytes.push((bitLength >>> (i * 8)) & 255);

    for (let offset = 0; offset < bytes.length; offset += 64) {

        for (let i = 0; i < 16; i++) {
            const j = offset + i * 4;
            W[i] = (bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3];
        }

        for (let i = 16; i < 64; i++) {
            const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
            const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
            W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
        }

        let [a, b, c, d, e, f, g, h] = H;

        for (let i = 0; i < 64; i++) {
            const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            const ch = (e & f) ^ (~e & g);
            const t1 = (h + S1 + ch + SHA_K[i] + W[i]) | 0;
            const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (S0 + maj) | 0;

            h = g; g = f; f = e; e = (d + t1) | 0;
            d = c; c = b; b = a; a = (t1 + t2) | 0;
        }

        H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
        H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
        H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
        H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;

    }

    return H.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");

}


function randomSalt() {

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");

}


function hashSecret(secret, salt) {

    let hash = sha256(salt + ":" + secret);

    for (let i = 1; i < HASH_ROUNDS; i++) {
        hash = sha256(salt + hash);
    }

    return hash;

}


function setPassword(account, password) {

    account.salt = randomSalt();
    account.password = hashSecret(password, account.salt);

}


function checkPassword(account, password) {

    return !!account.password &&
        hashSecret(password, account.salt) === account.password;

}


/* =========================================================
   ACCOUNTS
   ========================================================= */

function allAccounts() {

    return [
        ...(data.admins || []).map(acc => ({ acc, kind: "admin" })),
        ...data.users.map(acc => ({ acc, kind: "user" }))
    ];

}


function findByUsername(username) {

    const name = String(username).trim().toLowerCase();

    return name
        ? allAccounts().find(entry => (entry.acc.username || "").toLowerCase() === name) || null
        : null;

}


function isUsernameFree(username, ownId) {

    const found = findByUsername(username);

    return !found || found.acc.id === ownId;

}


function portalFor(entry) {

    return entry.kind === "admin" || ["Administrator", "Staff"].includes(entry.acc.role)
        ? "admin"
        : "student";

}


function currentAccount() {

    if (!session) {
        return null;
    }

    const list = session.kind === "admin" ? (data.admins || []) : data.users;

    return list.find(acc => acc.id === session.id) || null;

}


/*
    Makes sure the built-in admin exists, turns any seed
    passwords (from sample data) into hashes, and removes
    security-question fields left by older versions.
*/
function ensureAccounts() {

    let changed = false;

    if (!Array.isArray(data.admins) || !data.admins.length) {
        data.admins = structuredClone(sampleData.admins);
        changed = true;
    }

    if (!Array.isArray(data.resetRequests)) {
        data.resetRequests = [];
        changed = true;
    }

    [...data.admins, ...data.users].forEach(acc => {

        if (acc.seedPassword) {
            setPassword(acc, acc.seedPassword);
            delete acc.seedPassword;
            changed = true;
        }

        ["question", "answer", "answerSalt", "seedAnswer", "mustChange"].forEach(key => {
            if (key in acc) {
                delete acc[key];
                changed = true;
            }
        });

    });

    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
    }

}


/* =========================================================
   PASSWORD RULES
   ========================================================= */

function validatePassword(password, username = "") {

    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
        return "Password must include at least one letter and one number.";
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        return "Password must not contain your username.";
    }

    return "";

}


function passwordStrength(password) {

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-z0-9]/i.test(password)) score++;

    return [
        { width: 10, color: "var(--red)", label: "Too weak" },
        { width: 25, color: "var(--red)", label: "Weak" },
        { width: 50, color: "var(--amber)", label: "Fair" },
        { width: 70, color: "var(--amber)", label: "Good" },
        { width: 85, color: "var(--green)", label: "Strong" },
        { width: 100, color: "var(--green)", label: "Very strong" }
    ][password ? score : 0];

}


function generatePassword() {

    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(10);

    crypto.getRandomValues(bytes);

    const random = Array.from(bytes, b => chars[b % chars.length]).join("");

    /* "Lab" prefix + trailing digit guarantee a letter and a number */
    return "Lab" + random.slice(0, 6) + (bytes[9] % 10);

}


/* live strength meters + hints, wired by data attributes */
document.addEventListener("input", event => {

    const input = event.target;
    const meter = document.querySelector(`[data-strength-for="${input.id}"] i`);

    if (!meter) {
        return;
    }

    const s = passwordStrength(input.value);
    meter.style.width = s.width + "%";
    meter.style.background = s.color;

    const hint = document.querySelector(`[data-hint-for="${input.id}"]`);

    if (hint) {
        hint.textContent = input.value
            ? `${s.label}. ${validatePassword(input.value) || "Looks good!"}`
            : "At least 8 characters with a letter and a number.";
    }

});


/* show / hide password eye buttons */
document.addEventListener("click", event => {

    const eye = event.target.closest("[data-eye]");

    if (!eye) {
        return;
    }

    const input = document.getElementById(eye.dataset.eye);
    const show = input.type === "password";

    input.type = show ? "text" : "password";
    eye.innerHTML = ic(show ? "eyeOff" : "eye");
    eye.title = show ? "Hide password" : "Show password";

});


/* =========================================================
   LOCKOUT
   ========================================================= */

function readAttempts() {

    try {
        return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || {};
    } catch (error) {
        return {};
    }

}


function lockRemaining(key) {

    const entry = readAttempts()[key];

    return entry && entry.until > Date.now()
        ? Math.ceil((entry.until - Date.now()) / 1000)
        : 0;

}


function registerFailure(key) {

    const all = readAttempts();
    let entry = all[key] || { count: 0 };

    /* an expired lock starts a fresh count */
    if (entry.until && entry.until <= Date.now()) {
        entry = { count: 0 };
    }

    entry.count++;

    if (entry.count >= MAX_ATTEMPTS) {
        entry = { count: 0, until: Date.now() + LOCK_SECONDS * 1000 };
    }

    all[key] = entry;
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));

    return entry.until ? 0 : MAX_ATTEMPTS - entry.count;

}


function clearFailures(key) {

    const all = readAttempts();
    delete all[key];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));

}


/* disables a submit button with a live countdown while locked */
function showLock(form, errorEl, key) {

    const button = form.querySelector('[type="submit"]');
    const label = button.dataset.label || button.innerHTML;

    button.dataset.label = label;

    clearInterval(form.lockTimer);

    function tick() {

        const left = lockRemaining(key);

        if (left <= 0) {
            clearInterval(form.lockTimer);
            button.disabled = false;
            button.innerHTML = label;
            errorEl.textContent = "";
            return;
        }

        button.disabled = true;
        button.textContent = `Locked · ${left}s`;
        errorEl.textContent = `Too many failed attempts. Try again in ${left} seconds.`;

    }

    tick();
    form.lockTimer = setInterval(tick, 1000);

}


function clearLock(form, errorEl) {

    const button = form.querySelector('[type="submit"]');

    clearInterval(form.lockTimer);

    if (button.dataset.label) {
        button.disabled = false;
        button.innerHTML = button.dataset.label;
    }

    errorEl.textContent = "";

}


/* the lock belongs to a username: re-check it whenever the username changes */
document.getElementById("loginUser").addEventListener("input", event => {

    const form = document.getElementById("loginForm");
    const error = document.getElementById("loginError");
    const key = "login:" + event.target.value.trim().toLowerCase();

    clearLock(form, error);

    if (lockRemaining(key) > 0) {
        showLock(form, error, key);
    }

});


function shake(el) {

    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");

}


/* =========================================================
   SESSION
   ========================================================= */

function loadSession() {

    try {

        const saved = JSON.parse(
            sessionStorage.getItem(SESSION_KEY) ||
            localStorage.getItem(SESSION_KEY)
        );

        return saved && saved.v === 2 ? saved : null;

    } catch (error) {
        return null;
    }

}


function startSession(entry, remember) {

    session = {
        v: 2,
        kind: entry.kind,
        id: entry.acc.id,
        role: portalFor(entry)
    };

    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    (remember ? localStorage : sessionStorage)
        .setItem(SESSION_KEY, JSON.stringify(session));

    lastActivity = Date.now();

}


function endSession() {

    session = null;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);

}


/* idle auto-logout */
["click", "keydown", "mousemove", "touchstart"].forEach(type =>
    document.addEventListener(type, () => lastActivity = Date.now(), { passive: true })
);

setInterval(() => {

    if (session && Date.now() - lastActivity > IDLE_MINUTES * 60 * 1000) {
        logout();
        setLoginError(`You were signed out after ${IDLE_MINUTES} minutes of inactivity.`);
    }

}, 30 * 1000);


/* =========================================================
   LOGIN SCREEN
   ========================================================= */

function showView(id) {

    document
        .querySelectorAll(".auth-view")
        .forEach(view => view.classList.toggle("active", view.id === id));

    const first = document.querySelector(`#${id} input`);

    if (first) {
        setTimeout(() => first.focus(), 50);
    }

}


function setLoginError(message) {

    document.getElementById("loginError").textContent = message;

}


function showLogin() {

    const portal = document.getElementById("portal");

    document.getElementById("app").classList.remove("show");
    clearLock(document.getElementById("loginForm"), document.getElementById("loginError"));
    document.getElementById("loginForm").reset();
    document.querySelectorAll(".auth-error").forEach(el => el.textContent = "");

    showView("loginForm");

    portal.classList.remove("show");
    void portal.offsetWidth;
    portal.classList.add("show");

}


document.getElementById("portal").addEventListener("click", event => {

    const go = event.target.closest("[data-view]");

    if (go) {
        document.querySelectorAll(".auth-error").forEach(el => el.textContent = "");
        showView(go.dataset.view);
    }

});


document.getElementById("loginForm").addEventListener("submit", event => {

    event.preventDefault();

    const form = event.target;
    const error = document.getElementById("loginError");
    const username = form.username.value.trim().toLowerCase();
    const password = form.password.value;
    const key = "login:" + username;

    if (!username || !password) {
        error.textContent = "Please enter your username and password.";
        shake(form);
        return;
    }

    if (lockRemaining(key) > 0) {
        showLock(form, error, key);
        shake(form);
        return;
    }

    clearLock(form, error);

    const entry = findByUsername(username);

    if (!entry || !checkPassword(entry.acc, password)) {

        const left = registerFailure(key);

        form.password.value = "";
        shake(form);

        if (left === 0) {
            showLock(form, error, key);
        } else {
            error.textContent = left <= 2
                ? `Incorrect username or password. ${left} attempt${left === 1 ? "" : "s"} left.`
                : "Incorrect username or password.";
        }

        return;

    }

    clearFailures(key);
    startSession(entry, document.getElementById("rememberMe").checked);
    enterApp();

    toast(`Welcome, ${entry.acc.name.split(" ")[0]}!`);

});


/* ---------- forgot password: send a reset request to the admin ---------- */

document.getElementById("forgotStep1").addEventListener("submit", event => {

    event.preventDefault();

    const form = event.target;
    const error = document.getElementById("forgotError1");
    const username = document.getElementById("forgotUser").value.trim().toLowerCase();
    const note = document.getElementById("forgotNote").value.trim().slice(0, 200);

    if (!username) {
        error.textContent = "Please enter your username.";
        shake(form);
        return;
    }

    const entry = findByUsername(username);
    const alreadyOpen = entry && data.resetRequests.some(req =>
        req.username === entry.acc.username && req.status === "Open"
    );

    if (entry && !alreadyOpen) {

        data.resetRequests.push({
            id: nextId("RST", data.resetRequests),
            username: entry.acc.username,
            kind: entry.kind,
            accountId: entry.acc.id,
            name: entry.acc.name,
            note,
            date: new Date().toISOString(),
            status: "Open"
        });

        saveData();

    }

    /* same screen whether or not the username exists, so usernames can't be guessed */
    error.textContent = "";
    form.reset();
    showView("forgotDone");

});


/* =========================================================
   ACCOUNT SETTINGS (change own password)
   ========================================================= */

function openAccountModal() {

    const account = currentAccount();

    if (!account) {
        return;
    }

    openModal(
        "Account & password",
        `
        <p class="description" style="margin-bottom:16px">Signed in as <b>@${escapeHTML(account.username)}</b> · ${escapeHTML(account.name)}</p>

        <div class="form-grid">

            <div class="field full">
                <label>Current password *</label>
                <div class="input-ico">
                    ${ic("lock")}
                    <input type="password" name="current" id="accCurrent" autocomplete="current-password">
                    <button type="button" class="eye" data-eye="accCurrent">${ic("eye")}</button>
                </div>
            </div>

            <div class="field">
                <label>New password *</label>
                <div class="input-ico">
                    ${ic("lock")}
                    <input type="password" name="password" id="accNew" autocomplete="new-password">
                    <button type="button" class="eye" data-eye="accNew">${ic("eye")}</button>
                </div>
                <div class="strength" data-strength-for="accNew"><i></i></div>
                <small class="hint" data-hint-for="accNew">At least 8 characters with a letter and a number.</small>
            </div>

            <div class="field">
                <label>Confirm new password *</label>
                <div class="input-ico">
                    ${ic("lock")}
                    <input type="password" name="confirm" id="accConfirm" autocomplete="new-password">
                </div>
            </div>

        </div>

        <p class="auth-error" id="accError"></p>

        <div class="form-actions">
            <button type="button" class="secondary-button" onclick="closeModal()">Cancel</button>
            <button type="submit">Save password</button>
        </div>
        `
    );

    document.getElementById("modalForm").onsubmit = function (event) {

        event.preventDefault();

        const form = this;
        const error = document.getElementById("accError");
        const values = Object.fromEntries(new FormData(form).entries());

        if (!checkPassword(account, values.current || "")) {
            error.textContent = "Your current password is incorrect.";
            shake(form);
            return;
        }

        const problem = validatePassword(values.password, account.username);

        if (problem) {
            error.textContent = problem;
            shake(form);
            return;
        }

        if (values.password !== values.confirm) {
            error.textContent = "The two passwords don't match.";
            shake(form);
            return;
        }

        if (checkPassword(account, values.password)) {
            error.textContent = "Please choose a password different from the current one.";
            shake(form);
            return;
        }

        setPassword(account, values.password);

        saveData();
        closeModal();
        toast("Password updated");

    };

}


/* =========================================================
   ADMIN: SET / RESET A USER'S PASSWORD
   ========================================================= */

function openPasswordReset(userId, kind = "user") {

    const user = (kind === "admin" ? (data.admins || []) : data.users)
        .find(u => u.id === userId);

    if (!user) {
        return;
    }

    const temp = generatePassword();

    openModal(
        `Password for ${user.name}`,
        `
        <p class="description" style="margin-bottom:16px">
            Set a password and share it with ${escapeHTML(user.name)} privately.
            They can change it later by clicking their initials in the top right.
        </p>

        <div class="form-grid">

            <div class="field">
                <label>Login username *</label>
                <input name="username" value="${escapeHTML(user.username || "")}" autocomplete="off" required>
            </div>

            <div class="field">
                <label>Password *</label>
                <div class="input-ico">
                    ${ic("lock")}
                    <input name="password" id="resetPw" value="${temp}" autocomplete="off">
                    <button type="button" class="eye" title="Generate new" onclick="document.getElementById('resetPw').value = generatePassword()">${ic("refresh")}</button>
                </div>
            </div>

        </div>

        <p class="auth-error" id="resetError"></p>

        <div class="form-actions">
            <button type="button" class="secondary-button" onclick="closeModal()">Cancel</button>
            <button type="submit">Save password</button>
        </div>
        `
    );

    document.getElementById("modalForm").onsubmit = function (event) {

        event.preventDefault();

        const form = this;
        const error = document.getElementById("resetError");
        const values = Object.fromEntries(new FormData(form).entries());
        const username = values.username.trim().toLowerCase();

        if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
            error.textContent = "Username must be 3–30 characters: letters, numbers, dot, dash or underscore.";
            shake(form);
            return;
        }

        if (!isUsernameFree(username, user.id)) {
            error.textContent = "That username is already taken.";
            shake(form);
            return;
        }

        const problem = validatePassword(values.password, username);

        if (problem) {
            error.textContent = problem;
            shake(form);
            return;
        }

        const previousUsername = user.username;

        user.username = username;
        setPassword(user, values.password);

        /* this answers any open "forgot password" request for the account */
        (data.resetRequests || []).forEach(req => {
            if (req.status === "Open" && req.kind === kind && req.accountId === user.id) {
                req.status = "Resolved";
            }
        });

        clearFailures("login:" + username);
        clearFailures("login:" + previousUsername);

        saveData();
        closeModal();
        toast(`Password saved for @${username}`);

    };

}
