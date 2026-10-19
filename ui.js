/* =========================================================
   COMPUTER LABORATORY MANAGEMENT SYSTEM
   UI LAYER — portal, role-based navigation, dashboards,
   seat maps, reservations, student reports, animations.
   Loaded after app.js (uses its data + CRUD functions).
   ========================================================= */


const TIME_SLOTS = [
    "7:30 AM - 9:30 AM",
    "9:30 AM - 11:30 AM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM"
];

let adminRoom = null;
let adminSelected = null;
let studentRoom = null;
let studentSelected = null;
let reservationFilter = "all";
let reportRoom = null;
let reportSelected = undefined;   /* undefined = not chosen yet this session */


/* =========================================================
   ICONS
   ========================================================= */

const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    room: '<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M14 12h.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>'
};


function ic(name, style = "") {

    return `<svg class="ic" viewBox="0 0 24 24" style="${style}">${ICONS[name] || ""}</svg>`;

}


function hydrateIcons(root = document) {

    root
        .querySelectorAll("i[data-ic]")
        .forEach(el => {
            el.outerHTML = ic(el.dataset.ic);
        });

}


/* =========================================================
   HELPERS
   ========================================================= */

function toast(message) {

    const el = document.getElementById("toast");

    el.innerHTML = ic("check") + `<span>${escapeHTML(message)}</span>`;
    el.classList.add("show");

    clearTimeout(el.hideTimer);

    el.hideTimer = setTimeout(
        () => el.classList.remove("show"),
        2600
    );

}


/* =========================================================
   CONFIRM / ALERT DIALOG (replaces the browser's popups)
   ========================================================= */

let dialogResolve = null;


function openDialog({
    title,
    message,
    confirmText = "OK",
    cancelText = "Cancel",
    danger = false,
    alertOnly = false,
    icon = null
}) {

    /* a dialog that is replaced counts as cancelled */
    if (dialogResolve) {
        closeDialog(false);
    }

    const el = document.getElementById("dialog");
    const ok = document.getElementById("dialogOk");
    const cancel = document.getElementById("dialogCancel");

    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogMessage").textContent = message;
    document.getElementById("dialogIcon").innerHTML =
        ic(icon || (danger ? "trash" : alertOnly ? "alert" : "help"));

    ok.textContent = confirmText;
    cancel.textContent = cancelText;
    cancel.hidden = alertOnly;

    el.classList.toggle("danger", danger);
    el.classList.add("show");

    /* safe default: Cancel is focused for destructive actions */
    setTimeout(() => (danger && !alertOnly ? cancel : ok).focus(), 60);

    return new Promise(resolve => dialogResolve = resolve);

}


function closeDialog(result) {

    const resolve = dialogResolve;

    dialogResolve = null;
    document.getElementById("dialog").classList.remove("show");

    if (resolve) {
        resolve(result);
    }

}


function askConfirm(message, options = {}) {

    return openDialog({ title: "Are you sure?", message, ...options });

}


function showAlert(message, options = {}) {

    return openDialog({ title: "Please check this", message, alertOnly: true, ...options });

}


document.getElementById("dialogOk").addEventListener("click", () => closeDialog(true));
document.getElementById("dialogCancel").addEventListener("click", () => closeDialog(false));

document.getElementById("dialog").addEventListener("click", event => {
    if (event.target.id === "dialog") {
        closeDialog(false);
    }
});

/* Esc closes only the dialog, not the form underneath it */
document.addEventListener("keydown", event => {

    if (event.key === "Escape" && dialogResolve) {
        event.stopImmediatePropagation();
        closeDialog(false);
    }

}, true);


function todayISO() {

    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");

}


function formatDate(iso) {

    if (!iso) {
        return "—";
    }

    const d = new Date(iso + "T00:00:00");

    return d.toLocaleDateString(
        "en",
        { weekday: "short", month: "short", day: "numeric" }
    );

}


function nextId(prefix, list) {

    const max = list.reduce((highest, item) => {

        const number =
            parseInt(String(item.id).replace(/\D/g, ""), 10) || 0;

        return Math.max(highest, number);

    }, 0);

    return `${prefix}-${String(max + 1).padStart(3, "0")}`;

}


function percent(part, whole) {

    return whole ? Math.round(part / whole * 100) : 0;

}


function seatClass(availability) {

    return {
        "Available": "s-av",
        "In Use": "s-us",
        "Maintenance": "s-mt"
    }[availability] || "s-un";

}


function statusColor(status) {

    return {
        "Resolved": "var(--green)",
        "Under Maintenance": "var(--amber)",
        "Approved": "var(--green)",
        "Pending": "var(--blue)"
    }[status] || "var(--red)";

}


function computerById(id) {

    return data.computers.find(computer => computer.id === id);

}


function emptyNote(icon, text) {

    return `<div class="empty-note">${ic(icon)}${text}</div>`;

}


/* ---------- animated numbers / bars / rings ---------- */

function countTo(el, target) {

    if (!el) {
        return;
    }

    const start = parseFloat(el.dataset.current || 0);
    const decimals = String(target).includes(".") ? 1 : 0;
    const began = performance.now();

    el.dataset.current = target;

    function step(now) {

        const p = Math.min((now - began) / 1100, 1);
        const eased = 1 - Math.pow(1 - p, 3);

        el.textContent =
            (start + (target - start) * eased).toFixed(decimals);

        if (p < 1) {
            requestAnimationFrame(step);
        }

    }

    requestAnimationFrame(step);

}


function setBar(name, value) {

    const bar = document.querySelector(`[data-bar="${name}"]`);

    if (bar) {
        requestAnimationFrame(() =>
            setTimeout(() => bar.style.width = value + "%", 120)
        );
    }

}


function setRing(id, value) {

    const ring = document.getElementById(id);

    if (ring) {
        requestAnimationFrame(() =>
            setTimeout(() =>
                ring.style.strokeDashoffset = 345.6 - 345.6 * value / 100,
            150)
        );
    }

}


/* =========================================================
   SESSION (sign-in itself lives in auth.js)
   ========================================================= */

function currentStudent() {

    return session && session.role === "student"
        ? currentAccount()
        : null;

}


function logout() {

    endSession();
    closeModal();

    /* don't carry one person's selections over to the next sign-in */
    adminRoom = null;
    adminSelected = null;
    studentRoom = null;
    studentSelected = null;
    reportRoom = null;
    reportSelected = undefined;
    reservationFilter = "all";

    document
        .querySelectorAll("#resFilter button")
        .forEach(b => b.classList.toggle("on", b.dataset.filter === "all"));

    if (dialogResolve) {
        closeDialog(false);
    }
    showLogin();

}


function enterApp() {

    const account = currentAccount();

    if (!account) {
        logout();
        return;
    }

    const isAdmin = session.role === "admin";

    document.getElementById("portal").classList.remove("show");
    document.getElementById("app").classList.add("show");

    document
        .querySelectorAll(".nav-btn")
        .forEach(btn => btn.hidden = btn.dataset.for !== session.role);

    document.getElementById("roleChip").textContent = isAdmin
        ? (account.role || "Admin").toUpperCase()
        : `${(account.role || "Student").toUpperCase()}${account.department ? " · " + account.department.toUpperCase() : ""}`;

    document.getElementById("avatar").textContent =
        account.name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();

    renderUI();

    goTo(isAdmin ? "dashboard" : "student-home");

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function goTo(sectionId) {

    const section = document.getElementById(sectionId);

    if (!section) {
        return;
    }

    document
        .querySelectorAll(".nav-btn")
        .forEach(btn =>
            btn.classList.toggle("active", btn.dataset.section === sectionId)
        );

    document
        .querySelectorAll(".section")
        .forEach(s => s.classList.remove("active", "animate"));

    section.classList.add("active");
    void section.offsetWidth;
    section.classList.add("animate");

    document.getElementById("pageTitle").textContent =
        section.dataset.title || greeting();

    window.scrollTo({ top: 0, behavior: "smooth" });

}


function greeting() {

    const hour = new Date().getHours();
    const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const student = currentStudent();

    return `Good ${part}, ${student ? student.name.split(" ")[0] : "there"}`;

}


/* =========================================================
   RENDER — SHARED
   ========================================================= */

function renderUI() {

    if (!session) {
        return;
    }

    /* signed-in account was deleted or data was replaced */
    if (!currentAccount()) {
        logout();
        return;
    }

    document.getElementById("pageDate").textContent =
        new Date().toLocaleDateString(
            "en",
            { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        );

    if (session.role === "admin") {
        renderAdminDashboard();
        renderReservations();
    } else {
        renderStudent();
    }

}


function roomTabs(containerId, selected) {

    document.getElementById(containerId).innerHTML =
        data.rooms.map(room =>
            `<button type="button" class="${room.id === selected ? "on" : ""}" data-room="${escapeHTML(room.id)}">${escapeHTML(room.id)}</button>`
        ).join("");

}


/* =========================================================
   SEAT PLAN — 50 desks per room: rows A–E × seats 1–10,
   with a center aisle after seat 5.
   ========================================================= */

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;
const AISLE_AFTER = 5;
const SEATS_PER_ROOM = SEAT_ROWS.length * SEATS_PER_ROW;


function isValidSeat(seat) {

    const match = /^([A-Z])(\d{1,2})$/.exec(String(seat));

    return !!match &&
        SEAT_ROWS.includes(match[1]) &&
        +match[2] >= 1 &&
        +match[2] <= SEATS_PER_ROW;

}


function allSeatCodes() {

    return SEAT_ROWS.flatMap(row =>
        Array.from({ length: SEATS_PER_ROW }, (_, i) => row + (i + 1))
    );

}


/*
    One-time upgrade of older saved data:
    LAB-01 → Room 401, LAB-02 → Room 402, and adds any
    missing rooms up to Room 406.
*/
function ensureRooms() {

    if (data.roomsVersion === 2) {
        return;
    }

    const rename = { "LAB-01": "Room 401", "LAB-02": "Room 402" };
    const oldNames = { "LAB-01": "Computer Laboratory 1", "LAB-02": "Computer Laboratory 2" };

    data.rooms.forEach(room => {

        const to = rename[room.id];

        if (to && !data.rooms.some(r => r.id === to)) {

            if (room.name === oldNames[room.id]) {
                room.name = "Computer " + to;
            }

            room.id = to;

        }

    });

    [...data.computers, ...data.users].forEach(item => {
        if (rename[item.room]) {
            item.room = rename[item.room];
        }
    });

    sampleData.rooms.forEach(room => {
        if (!data.rooms.some(r => r.id === room.id)) {
            data.rooms.push(structuredClone(room));
        }
    });

    data.roomsVersion = 2;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));

}


/* One-time: the demo student's section was renamed BSIT 2-A → BSIT 2D. */
function ensureSection() {

    const student = data.users.find(u => u.id === "USR-002" && u.department === "BSIT 2-A");

    if (student) {
        student.department = "BSIT 2D";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
    }

}


/*
    Gives every computer a unique seat in its room.
    Computers with no seat (or a clashing one) get the
    next free desk, front row first.
*/
function ensureSeats() {

    const taken = {};
    const placed = new Set();
    let changed = false;

    data.computers.forEach(computer => {

        const roomSeats = taken[computer.room] = taken[computer.room] || new Set();

        if (isValidSeat(computer.seat) && !roomSeats.has(computer.seat)) {
            roomSeats.add(computer.seat);
            placed.add(computer);
        }

    });

    data.computers.forEach(computer => {

        if (placed.has(computer)) {
            return;
        }

        const roomSeats = taken[computer.room];
        const free = allSeatCodes().find(code => !roomSeats.has(code)) || "";

        if (computer.seat !== free) {
            computer.seat = free;
            changed = true;
        }

        if (free) {
            roomSeats.add(free);
        }

    });

    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
    }

}


/*
    One-time fill: puts a computer on every empty desk in
    Rooms 401–406 (50 per room). IDs look like PC-401-01,
    where 01–50 is the desk number (A1 = 01 … E10 = 50).
*/
const ROOM_MODELS = {
    "Room 401": { brand: "Dell", model: "OptiPlex 7090", cpu: "Intel Core i5-11500", ram: "16 GB", storage: "512 GB SSD", os: "Windows 11" },
    "Room 402": { brand: "HP", model: "ProDesk 400 G7", cpu: "Intel Core i5-10500", ram: "8 GB", storage: "256 GB SSD", os: "Windows 11" },
    "Room 403": { brand: "Lenovo", model: "ThinkCentre M720", cpu: "Intel Core i5-8500", ram: "8 GB", storage: "1 TB HDD", os: "Windows 10" },
    "Room 404": { brand: "Acer", model: "Veriton X", cpu: "Intel Core i3-10100", ram: "8 GB", storage: "256 GB SSD", os: "Windows 10" },
    "Room 405": { brand: "Dell", model: "OptiPlex 3080", cpu: "Intel Core i5-10505", ram: "16 GB", storage: "512 GB SSD", os: "Windows 11" },
    "Room 406": { brand: "HP", model: "EliteDesk 800 G6", cpu: "Intel Core i7-10700", ram: "16 GB", storage: "512 GB SSD", os: "Windows 11" }
};


function fillAllSeats() {

    if (data.seatsFilled === 1) {
        return;
    }

    const codes = allSeatCodes();

    Object.keys(ROOM_MODELS).forEach(roomId => {

        if (!data.rooms.some(room => room.id === roomId)) {
            return;
        }

        const taken = new Set(
            data.computers.filter(c => c.room === roomId).map(c => c.seat)
        );

        codes.forEach((code, index) => {

            const number = index + 1;
            const id = `PC-${roomId.replace(/\D/g, "")}-${String(number).padStart(2, "0")}`;

            if (taken.has(code) || data.computers.some(c => c.id === id)) {
                return;
            }

            /* a realistic mix so the live map isn't all one color */
            const availability =
                number % 17 === 9 ? "Maintenance" :
                number % 3 === 1 ? "In Use" :
                "Available";

            data.computers.push({
                id,
                room: roomId,
                seat: code,
                ...ROOM_MODELS[roomId],
                gpu: "Integrated",
                availability,
                assignedUser: ""
            });

        });

    });

    data.seatsFilled = 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));

}


function seatMap(containerId, roomId, selected, mineSet = new Set(), canAdd = false) {

    const box = document.getElementById(containerId);

    if (!roomId) {
        box.innerHTML = emptyNote("room", "Add a computer room first.");
        return;
    }

    const computers = data.computers.filter(computer => computer.room === roomId);
    const bySeat = Object.fromEntries(computers.filter(c => c.seat).map(c => [c.seat, c]));
    const unplaced = computers.filter(c => !c.seat).length;
    const available = computers.filter(c => c.availability === "Available").length;

    const numbers = Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1);

    const header = `
        <span></span>
        ${numbers.map(n => `${n === AISLE_AFTER + 1 ? "<span></span>" : ""}<span class="col-label">${n}</span>`).join("")}`;

    let index = 0;

    const rows = SEAT_ROWS.map(row => `
        <span class="row-label">${row}</span>
        ${numbers.map(n => {

            const code = row + n;
            const computer = bySeat[code];
            const aisle = n === AISLE_AFTER + 1 ? `<span class="aisle"></span>` : "";
            const delay = `style="--i:${index++}"`;

            if (!computer) {

                return aisle + (canAdd
                    ? `<button type="button" class="seat s-empty can-add" ${delay} data-empty="${code}" title="Seat ${code} · empty — click to add a computer">${ic("plus")}</button>`
                    : `<span class="seat s-empty" ${delay} title="Seat ${code} · no computer"></span>`);

            }

            const cls = mineSet.has(computer.id) ? "s-me" : seatClass(computer.availability);

            return aisle + `
                <button
                    type="button"
                    class="seat ${cls} ${computer.id === selected ? "sel" : ""}"
                    ${delay}
                    data-seat="${escapeHTML(computer.id)}"
                    title="Seat ${code} · ${escapeHTML(computer.id)} · ${escapeHTML(computer.availability)}"
                >
                    ${ic("pc")}<span>${escapeHTML(computer.id.replace(/^PC-(\d{3}-)?/, ""))}</span>
                </button>`;

        }).join("")}`).join("");

    box.innerHTML = `
        <div class="plan-scroll">
            <div class="plan">

                <div class="plan-front">
                    <span class="whiteboard">WHITEBOARD</span>
                    <span class="teacher-desk">${ic("user")}Teacher's desk</span>
                </div>

                <div class="plan-grid">
                    ${header}
                    ${rows}
                </div>

                <div class="plan-foot">
                    <span class="door">${ic("out")}Entrance</span>
                    <span><b>${computers.length - unplaced}</b>/${SEATS_PER_ROOM} desks with computers · <b>${available}</b> available</span>
                </div>

                ${unplaced
                    ? `<p class="plan-warn">${ic("alert")}${unplaced} computer${unplaced === 1 ? " has" : "s have"} no free desk — this room is full.</p>`
                    : ""}

            </div>
        </div>`;

}


function specGrid(computer) {

    return `
        <div class="spec">
            <div><small>Model</small><b>${escapeHTML(computer.brand)} ${escapeHTML(computer.model)}</b></div>
            <div><small>CPU</small><b>${escapeHTML(computer.cpu || "—")}</b></div>
            <div><small>RAM</small><b>${escapeHTML(computer.ram || "—")}</b></div>
            <div><small>Storage</small><b>${escapeHTML(computer.storage || "—")}</b></div>
            <div><small>OS</small><b>${escapeHTML(computer.os || "—")}</b></div>
            <div><small>Room · Seat</small><b>${escapeHTML(computer.room || "—")} · ${escapeHTML(computer.seat || "—")}</b></div>
        </div>`;

}


function reportTimeline(reports) {

    if (!reports.length) {
        return emptyNote("check", "No problem reports. All good!");
    }

    return reports
        .slice()
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 6)
        .map((report, index) => `
            <div class="it" style="--i:${index}">
                <span class="d" style="--c:${statusColor(report.status)}"></span>
                <div>
                    <b>${escapeHTML(report.computer)} · ${escapeHTML(report.problem)}</b>
                    <small>${escapeHTML(report.reportedBy || "—")} · ${formatDate(report.date)} · ${escapeHTML(report.status)}</small>
                </div>
            </div>`)
        .join("");

}


/* =========================================================
   RENDER — ADMIN
   ========================================================= */

function renderAdminDashboard() {

    const computers = data.computers;
    const total = computers.length;
    const count = status => computers.filter(c => c.availability === status).length;

    const available = count("Available");
    const inUse = count("In Use");
    const maintenance = count("Maintenance");
    const openReports = data.reports.filter(r => r.status !== "Resolved").length;
    const pending = data.reservations.filter(r => r.status === "Pending");

    countTo(document.getElementById("totalComputers"), total);
    countTo(document.getElementById("availableComputers"), available);
    countTo(document.getElementById("inUseComputers"), inUse);
    countTo(document.getElementById("maintenanceComputers"), maintenance);
    countTo(document.getElementById("openReports"), openReports);

    setBar("total", total ? 100 : 0);
    setBar("available", percent(available, total));
    setBar("inuse", percent(inUse, total));
    setBar("maintenance", percent(maintenance, total));
    setBar("reports", percent(openReports, data.reports.length));

    document.getElementById("adminHeroTitle").textContent =
        `${inUse} of ${total} computers are in use right now.`;

    document.getElementById("adminHeroSub").textContent =
        `${openReports} open problem report${openReports === 1 ? "" : "s"} · ` +
        `${pending.length} reservation${pending.length === 1 ? "" : "s"} waiting for approval.`;

    countTo(document.getElementById("adminRingText"), percent(inUse, total));
    setRing("adminRing", percent(inUse, total));

    const resetOpen = openResetRequests().length;

    document.getElementById("pendingCount").textContent =
        pending.length || "";

    document.getElementById("resetCount").textContent =
        resetOpen || "";

    document.getElementById("bellBtn").classList.toggle(
        "has",
        pending.length + openReports + resetOpen > 0
    );

    renderResetRequests();

    /* seat map */
    if (!data.rooms.some(room => room.id === adminRoom)) {
        adminRoom = data.rooms[0] ? data.rooms[0].id : null;
    }

    if (!computerById(adminSelected)) {
        adminSelected = null;
    }

    roomTabs("adminRoomTabs", adminRoom);
    seatMap("adminSeats", adminRoom, adminSelected, new Set(), true);
    renderAdminDetail();

    /* maintenance log */
    document.getElementById("adminTimeline").innerHTML =
        reportTimeline(data.reports);

    /* laboratories */
    document.getElementById("adminLabs").innerHTML = data.rooms.length
        ? data.rooms.map((room, index) => {

            const units = computers.filter(c => c.room === room.id);
            const used = units.filter(c => c.availability === "In Use").length;

            return `
                <div class="r" style="--i:${index}">
                    <b>${escapeHTML(room.id)}</b>
                    <div>${escapeHTML(room.name)}<br><small>${escapeHTML(room.location)} · ${escapeHTML(room.assignedUser || "No teacher")}</small></div>
                    <div class="bar"><i style="width:${percent(used, units.length)}%"></i></div>
                    <small>${used}/${units.length} in use</small>
                </div>`;

          }).join("")
        : emptyNote("room", "No rooms yet.");

    /* pending reservations */
    document.getElementById("adminPending").innerHTML = pending.length
        ? pending.slice(0, 4).map((res, index) => `
            <div class="list-row" style="--i:${index}">
                <div class="li-ico">${ic("cal")}</div>
                <div>
                    <b>${escapeHTML(getUserName(res.user))} · ${escapeHTML(res.computer)}</b>
                    <small>${formatDate(res.date)} · ${escapeHTML(res.time)}</small>
                </div>
                <div class="row-acts">
                    <button class="ok-button" onclick="setReservationStatus('${res.id}','Approved')" title="Approve">${ic("check")}</button>
                    <button class="delete-button" onclick="setReservationStatus('${res.id}','Declined')" title="Decline">${ic("x")}</button>
                </div>
            </div>`).join("")
        : emptyNote("check", "No reservations waiting.");

}


function renderAdminDetail() {

    const box = document.getElementById("adminDetail");
    const computer = computerById(adminSelected);

    if (!computer) {
        box.innerHTML = emptyNote("pc", "Select a computer on the seat map to see its specs and quick actions.");
        return;
    }

    box.innerHTML = `
        <div class="detail">
            <div class="pc-head">
                <div class="pc-ico">${ic("pc")}</div>
                <div>
                    <b>${escapeHTML(computer.id)}</b><br>
                    ${statusBadge(computer.availability)}
                </div>
            </div>

            ${specGrid(computer)}

            <small style="color:var(--muted)">Assigned user: <b style="color:var(--ink)">${escapeHTML(computer.assignedUser ? getUserName(computer.assignedUser) : "—")}</b></small>

            <div class="acts">
                ${computer.availability !== "Available"
                    ? `<button class="ok-button" onclick="quickStatus('${computer.id}','Available')">Mark Available</button>` : ""}
                ${computer.availability !== "Maintenance"
                    ? `<button class="secondary-button" onclick="quickStatus('${computer.id}','Maintenance')">Flag Maintenance</button>` : ""}
            </div>

            <div class="acts">
                <button class="edit-button" onclick="editComputer('${computer.id}')">Edit</button>
                <button class="delete-button" onclick="deleteComputer('${computer.id}')">Delete</button>
            </div>
        </div>`;

}


function quickStatus(id, status) {

    const computer = computerById(id);

    if (computer) {
        computer.availability = status;
        saveData();
        toast(`${id} marked as ${status}`);
    }

}


/* ---------- forgot-password requests (Users page) ---------- */

function openResetRequests() {

    return (data.resetRequests || []).filter(req => req.status === "Open");

}


function timeAgo(iso) {

    const minutes = Math.round((Date.now() - new Date(iso)) / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hr ago`;

    return formatDate(iso.slice(0, 10));

}


function renderResetRequests() {

    const box = document.getElementById("resetRequests");
    const list = openResetRequests();

    if (!list.length) {
        box.innerHTML = "";
        return;
    }

    box.innerHTML = `
        <div class="card reset-card">
            <div class="card-head">
                <h3>${ic("lock")}Password reset requests <span class="badge reported">${list.length}</span></h3>
            </div>
            ${list.map((req, index) => `
                <div class="list-row" style="--i:${index}">
                    <div class="li-ico">${ic("user")}</div>
                    <div>
                        <b>${escapeHTML(req.name)} <small>@${escapeHTML(req.username)}</small></b>
                        <small>${timeAgo(req.date)}${req.note ? " · “" + escapeHTML(req.note) + "”" : ""}</small>
                    </div>
                    <div class="row-acts">
                        <button class="edit-button" onclick="openPasswordReset('${escapeHTML(req.accountId)}', '${req.kind}')">Set password</button>
                        <button class="delete-button" onclick="dismissResetRequest('${req.id}')">Dismiss</button>
                    </div>
                </div>`).join("")}
        </div>`;

}


function dismissResetRequest(id) {

    const req = (data.resetRequests || []).find(r => r.id === id);

    if (req) {
        req.status = "Dismissed";
        saveData();
        toast("Request dismissed");
    }

}


function renderReservations() {

    const table = document.getElementById("reservationTable");

    const list = data.reservations
        .filter(res => reservationFilter === "all" || res.status === reservationFilter)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    if (!list.length) {
        table.innerHTML = `<tr><td colspan="8" class="empty">No reservations found.</td></tr>`;
        return;
    }

    table.innerHTML = list.map(res => {

        const computer = computerById(res.computer);

        return `
            <tr>
                <td><strong>${escapeHTML(res.id)}</strong></td>
                <td>${escapeHTML(getUserName(res.user))}</td>
                <td>${escapeHTML(res.computer)}<br><small style="color:var(--muted)">${escapeHTML(computer ? computer.room : "Removed")}</small></td>
                <td>${formatDate(res.date)}</td>
                <td>${escapeHTML(res.time)}</td>
                <td>${escapeHTML(res.purpose || "—")}</td>
                <td><span class="badge ${res.status.toLowerCase()}">${escapeHTML(res.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        ${res.status !== "Approved"
                            ? `<button class="ok-button" onclick="setReservationStatus('${res.id}','Approved')">Approve</button>` : ""}
                        ${res.status !== "Declined"
                            ? `<button class="edit-button" onclick="setReservationStatus('${res.id}','Declined')">Decline</button>` : ""}
                        <button class="delete-button" onclick="deleteReservation('${res.id}')">Delete</button>
                    </div>
                </td>
            </tr>`;

    }).join("");

}


function setReservationStatus(id, status) {

    const res = data.reservations.find(r => r.id === id);

    if (res) {
        res.status = status;
        saveData();
        toast(`${id} ${status.toLowerCase()}`);
    }

}


async function deleteReservation(id) {

    if (!await askConfirm(
        `Reservation ${id} by ${getUserName((data.reservations.find(r => r.id === id) || {}).user)} will be permanently removed.`,
        { title: "Delete reservation?", confirmText: "Delete", danger: true }
    )) {
        return;
    }

    data.reservations = data.reservations.filter(r => r.id !== id);
    saveData();
    toast(`${id} deleted`);

}


/* =========================================================
   RENDER — STUDENT
   ========================================================= */

function myActiveReservations(student) {

    return data.reservations.filter(res =>
        res.user === student.id &&
        res.status !== "Declined" &&
        res.date >= todayISO()
    );

}


function renderStudent() {

    const student = currentStudent();

    if (!student) {
        logout();
        return;
    }

    const myRes = data.reservations.filter(res => res.user === student.id);
    const active = myActiveReservations(student)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const approved = myRes.filter(res => res.status === "Approved").length;
    const myReports = data.reports.filter(report => report.reportedBy === student.name);
    const openReports = myReports.filter(report => report.status !== "Resolved").length;
    const total = data.computers.length;
    const free = data.computers.filter(c => c.availability === "Available").length;

    /* hero */
    const next = active[0];
    const nextPc = next ? computerById(next.computer) : null;

    document.getElementById("stuHeroLabel").textContent =
        next ? "Your next session" : "Welcome to the lab";

    document.getElementById("stuHeroTitle").textContent = next
        ? `${next.purpose || "Lab session"} · ${nextPc ? nextPc.room + ", " : ""}${next.computer}`
        : "No upcoming sessions yet.";

    document.getElementById("stuHeroSub").textContent = next
        ? `${formatDate(next.date)} · ${next.time} · ${next.status}`
        : `${free} computer${free === 1 ? " is" : "s are"} free right now — reserve one in a few clicks.`;

    countTo(document.getElementById("stuRingText"), percent(free, total));
    setRing("stuRing", percent(free, total));

    /* kpis */
    countTo(document.getElementById("stuResCount"), myRes.length);
    countTo(document.getElementById("stuApproved"), approved);
    countTo(document.getElementById("stuReports"), openReports);
    countTo(document.getElementById("stuFree"), free);

    setBar("stuRes", myRes.length ? 100 : 0);
    setBar("stuApproved", percent(approved, myRes.length));
    setBar("stuReports", percent(openReports, myReports.length));
    setBar("stuFree", percent(free, total));

    document.getElementById("bellBtn").classList.toggle(
        "has",
        active.some(res => res.status === "Approved")
    );

    /* my reservations */
    document.getElementById("stuResList").innerHTML = myRes.length
        ? myRes
            .slice()
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .map((res, index) => {

                const pc = computerById(res.computer);
                const cancellable = res.status !== "Declined" && res.date >= todayISO();

                return `
                    <div class="list-row" style="--i:${index}">
                        <div class="li-ico">${ic("cal")}</div>
                        <div>
                            <b>${escapeHTML(res.computer)} · ${escapeHTML(pc ? pc.room : "—")}</b>
                            <small>${formatDate(res.date)} · ${escapeHTML(res.time)} · ${escapeHTML(res.purpose || "Lab session")}</small>
                        </div>
                        <div class="row-acts">
                            <span class="badge ${res.status.toLowerCase()}">${escapeHTML(res.status)}</span>
                            ${cancellable
                                ? `<button class="delete-button" onclick="cancelReservation('${res.id}')" title="Cancel">${ic("x")}</button>` : ""}
                        </div>
                    </div>`;

            }).join("")
        : emptyNote("cal", "You have no reservations yet.");

    /* my computer */
    const myPc = computerById(student.computer);

    document.getElementById("stuMyPc").innerHTML = myPc
        ? `<div class="detail">
               <div class="card-head" style="margin:0"><h3>My assigned computer</h3>${statusBadge(myPc.availability)}</div>
               <div class="pc-head"><div class="pc-ico">${ic("pc")}</div><div><b>${escapeHTML(myPc.id)}</b><br><small style="color:var(--muted)">${escapeHTML(myPc.room)}</small></div></div>
               ${specGrid(myPc)}
           </div>`
        : `<div class="card-head"><h3>My assigned computer</h3></div>
           ${emptyNote("pc", "No computer is assigned to you. Reserve one for your next class.")}`;

    /* report timelines */
    document.getElementById("stuTimeline").innerHTML = reportTimeline(myReports);
    document.getElementById("stuTimeline2").innerHTML = reportTimeline(myReports);

    /* reserve page */
    if (!data.rooms.some(room => room.id === studentRoom)) {
        studentRoom = student.room && data.rooms.some(r => r.id === student.room)
            ? student.room
            : (data.rooms[0] ? data.rooms[0].id : null);
    }

    if (!computerById(studentSelected)) {
        studentSelected = null;
    }

    roomTabs("stuRoomTabs", studentRoom);
    seatMap("stuSeats", studentRoom, studentSelected, new Set(active.map(res => res.computer)));
    renderStudentDetail();

    renderReportPicker(student, active);

}


/* ---------- "Report a problem": pick the computer on the seat map ---------- */

function renderReportPicker(student, active) {

    /* first visit: start on the student's own PC, or their room */
    if (reportSelected === undefined) {
        reportSelected = computerById(student.computer) ? student.computer : null;
    }

    if (reportSelected && !computerById(reportSelected)) {
        reportSelected = null;
    }

    if (!data.rooms.some(room => room.id === reportRoom)) {
        const pc = computerById(reportSelected);
        reportRoom = pc ? pc.room
            : data.rooms.some(r => r.id === student.room) ? student.room
            : (data.rooms[0] ? data.rooms[0].id : null);
    }

    /* shortcuts: assigned PC + PCs with an upcoming reservation */
    const mine = [...new Set([student.computer, ...active.map(res => res.computer)])]
        .map(computerById)
        .filter(Boolean);

    document.getElementById("repMine").innerHTML = mine.length
        ? `<span class="hint">Your computers:</span>` + mine.map(pc => `
            <button type="button" class="my-pc ${pc.id === reportSelected ? "on" : ""}" data-pick="${escapeHTML(pc.id)}">
                ${ic("pc")}${escapeHTML(pc.id)} <small>${escapeHTML(pc.room)} · ${escapeHTML(pc.seat || "—")}</small>
            </button>`).join("")
        : "";

    roomTabs("repRoomTabs", reportRoom);
    seatMap("repSeats", reportRoom, reportSelected);
    updateReportPicked();

}


function updateReportPicked() {

    const pc = computerById(reportSelected);

    document.getElementById("stuReportPc").value = pc ? pc.id : "";

    document.getElementById("repPicked").innerHTML = pc
        ? `<div class="picked-pc">
               <div class="pc-ico">${ic("pc")}</div>
               <div><b>${escapeHTML(pc.id)}</b><small>${escapeHTML(pc.room)} · Desk ${escapeHTML(pc.seat || "—")} · ${escapeHTML(pc.brand)} ${escapeHTML(pc.model)}</small></div>
               ${statusBadge(pc.availability)}
           </div>`
        : `<p class="hint">Tap the computer you're using on the map above.</p>`;

    document
        .querySelectorAll("#repMine .my-pc")
        .forEach(b => b.classList.toggle("on", b.dataset.pick === reportSelected));

}


function pickReportComputer(id) {

    const pc = computerById(id);

    if (!pc) {
        return;
    }

    reportSelected = id;

    if (pc.room !== reportRoom) {
        reportRoom = pc.room;
        roomTabs("repRoomTabs", reportRoom);
        seatMap("repSeats", reportRoom, reportSelected);
    } else {
        document
            .querySelectorAll("#repSeats .seat")
            .forEach(s => s.classList.toggle("sel", s.dataset.seat === id));
    }

    updateReportPicked();

}


function renderStudentDetail() {

    const box = document.getElementById("stuDetail");
    const student = currentStudent();
    const computer = computerById(studentSelected);

    if (!computer) {
        box.innerHTML = emptyNote("pc", "Pick a green seat on the map to reserve it.");
        return;
    }

    const mine = myActiveReservations(student)
        .filter(res => res.computer === computer.id);

    let body;

    if (mine.length) {

        body = `
            <p class="description">You already reserved this computer:</p>
            ${mine.map(res => `<div class="spec"><div style="grid-column:1/-1"><small>${escapeHTML(res.status)}</small><b>${formatDate(res.date)} · ${escapeHTML(res.time)}</b></div></div>`).join("")}`;

    } else if (computer.availability === "Available") {

        body = `
            <form class="res-form" id="reserveForm">
                <div class="field">
                    <label>Date *</label>
                    <input type="date" name="date" min="${todayISO()}" value="${todayISO()}" required>
                </div>
                <div class="field">
                    <label>Time slot *</label>
                    <select name="time" required>
                        ${TIME_SLOTS.map(slot => `<option>${slot}</option>`).join("")}
                    </select>
                </div>
                <div class="field full">
                    <label>Purpose / subject</label>
                    <input name="purpose" placeholder="e.g. Programming 2">
                </div>
                <div class="full">
                    <button type="submit" style="width:100%">${ic("cal")}Reserve ${escapeHTML(computer.id)}</button>
                </div>
            </form>`;

    } else {

        body = emptyNote(
            "alert",
            `This computer is ${computer.availability.toLowerCase()} right now. Please pick a green seat.`
        );

    }

    box.innerHTML = `
        <div class="detail">
            <div class="pc-head">
                <div class="pc-ico">${ic("pc")}</div>
                <div><b>${escapeHTML(computer.id)}</b><br>${statusBadge(mine.length ? "Reserved by you" : computer.availability)}</div>
            </div>
            ${specGrid(computer)}
            ${body}
        </div>`;

    const form = document.getElementById("reserveForm");

    if (form) {
        form.onsubmit = submitReservation;
    }

}


function submitReservation(event) {

    event.preventDefault();

    const student = currentStudent();
    const values = Object.fromEntries(new FormData(event.target).entries());

    const clash = data.reservations.some(res =>
        res.computer === studentSelected &&
        res.date === values.date &&
        res.time === values.time &&
        res.status !== "Declined"
    );

    if (clash) {
        toast("That slot is already booked — try another time.");
        return;
    }

    const id = nextId("RES", data.reservations);

    data.reservations.push({
        id,
        user: student.id,
        computer: studentSelected,
        date: values.date,
        time: values.time,
        purpose: values.purpose.trim(),
        status: "Pending"
    });

    saveData();
    toast(`Reserved ${studentSelected} — waiting for approval`);

}


async function cancelReservation(id) {

    const res = data.reservations.find(r => r.id === id) || {};

    if (!await askConfirm(
        `Your reservation for ${res.computer} on ${formatDate(res.date)} (${res.time}) will be cancelled.`,
        { title: "Cancel reservation?", confirmText: "Cancel reservation", cancelText: "Keep it", danger: true, icon: "cal" }
    )) {
        return;
    }

    data.reservations = data.reservations.filter(res => res.id !== id);
    saveData();
    toast("Reservation cancelled");

}


function submitStudentReport(event) {

    event.preventDefault();

    const student = currentStudent();
    const form = event.target;
    const computerId = form.computer.value;
    const details = form.details.value.trim();
    const issues = [...document.querySelectorAll("#issueChips .on")].map(b => b.textContent.trim());

    if (!computerId) {
        toast("Tap the computer you're using on the map first.");
        document.getElementById("repSeats").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    if (!issues.length && !details) {
        toast("Pick an issue type or describe the problem.");
        return;
    }

    const id = nextId("REP", data.reports);

    data.reports.push({
        id,
        computer: computerId,
        problem: [issues.join(", "), details].filter(Boolean).join(": "),
        reportedBy: student.name,
        date: todayISO(),
        status: "Reported",
        action: ""
    });

    const computer = computerById(computerId);

    if (computer) {
        computer.availability = "Maintenance";
    }

    form.reset();
    document.querySelectorAll("#issueChips .on").forEach(b => b.classList.remove("on"));
    reportSelected = null;

    saveData();
    toast(`Report ${id} sent to the lab staff`);

}


/* =========================================================
   EVENTS
   ========================================================= */

document.querySelectorAll(".nav-btn").forEach(btn =>
    btn.addEventListener("click", () => goTo(btn.dataset.section))
);

document.getElementById("logoutBtn").addEventListener("click", () => {
    logout();
    toast("You have been signed out");
});

document.getElementById("avatar").addEventListener("click", () => openAccountModal());

document.getElementById("bellBtn").addEventListener("click", () => {

    if (session.role === "admin") {
        const pending = data.reservations.filter(r => r.status === "Pending").length;
        const open = data.reports.filter(r => r.status !== "Resolved").length;
        const resets = openResetRequests().length;
        toast(`${pending} pending reservation(s) · ${open} open report(s) · ${resets} password request(s)`);
    } else {
        const student = currentStudent();
        const approved = myActiveReservations(student).filter(r => r.status === "Approved").length;
        toast(`${approved} approved upcoming reservation(s)`);
    }

});

/* seat maps + room tabs (event delegation) */
document.getElementById("app").addEventListener("click", event => {

    const tab = event.target.closest("[data-room]");
    const seat = event.target.closest("[data-seat]");
    const emptyDesk = event.target.closest("[data-empty]");

    if (emptyDesk) {
        openComputerModal(null, { room: adminRoom, seat: emptyDesk.dataset.empty });
        return;
    }

    /* report-a-problem picker: room tabs, seats and "your computers" chips */
    const pick = event.target.closest("[data-pick]");

    if (pick) {
        pickReportComputer(pick.dataset.pick);
        return;
    }

    if (tab && tab.closest("#repRoomTabs")) {
        reportRoom = tab.dataset.room;
        roomTabs("repRoomTabs", reportRoom);
        seatMap("repSeats", reportRoom, reportSelected);
        return;
    }

    if (seat && seat.closest("#repSeats")) {
        pickReportComputer(seat.dataset.seat);
        return;
    }

    if (tab) {

        if (tab.closest("#adminRoomTabs")) {
            adminRoom = tab.dataset.room;
            adminSelected = null;
        } else {
            studentRoom = tab.dataset.room;
            studentSelected = null;
        }

        renderUI();
        return;

    }

    if (seat) {

        const isAdminMap = !!seat.closest("#adminSeats");

        if (isAdminMap) {
            adminSelected = seat.dataset.seat;
            renderAdminDetail();
        } else {
            studentSelected = seat.dataset.seat;
            renderStudentDetail();
        }

        seat.closest(".plan-grid")
            .querySelectorAll(".seat")
            .forEach(s => s.classList.toggle("sel", s === seat));

    }

});

document.getElementById("resFilter").addEventListener("click", event => {

    const btn = event.target.closest("button");

    if (!btn) {
        return;
    }

    reservationFilter = btn.dataset.filter;

    btn.parentNode
        .querySelectorAll("button")
        .forEach(b => b.classList.toggle("on", b === btn));

    renderReservations();

});

document.getElementById("issueChips").addEventListener("click", event => {

    const btn = event.target.closest("button");

    if (btn) {
        btn.classList.toggle("on");
    }

});

document.getElementById("stuReportForm").addEventListener("submit", submitStudentReport);

/* close modal when clicking the dark backdrop */
document.getElementById("modal").addEventListener("click", event => {

    if (event.target.id === "modal") {
        closeModal();
    }

});


/* =========================================================
   HOOK INTO app.js RENDERING
   ========================================================= */

const baseRenderAll = renderAll;

renderAll = function () {

    ensureAccounts();
    ensureRooms();
    ensureSection();
    ensureSeats();
    fillAllSeats();
    baseRenderAll();
    renderUI();

};


/* =========================================================
   START
   ========================================================= */

hydrateIcons();
ensureAccounts();
ensureRooms();
ensureSection();
ensureSeats();
fillAllSeats();
baseRenderAll();

if (session && currentAccount()) {
    enterApp();
} else {
    endSession();
    showLogin();
}
