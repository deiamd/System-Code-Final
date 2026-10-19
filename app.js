/* =========================================================
   COMPUTER LABORATORY MANAGEMENT SYSTEM
   CRUD APPLICATION
   ========================================================= */


const STORAGE_KEY = "computerLaboratoryData";


/* =========================================================
   SAMPLE DATA
   ========================================================= */

const sampleData = {

    computers: [

        {
            id: "PC-001",
            room: "Room 401",
            seat: "A1",
            brand: "Dell",
            model: "OptiPlex 7090",
            cpu: "Intel Core i5-11500",
            ram: "16 GB",
            storage: "512 GB SSD",
            gpu: "Integrated",
            os: "Windows 11",
            availability: "Available",
            assignedUser: ""
        },

        {
            id: "PC-002",
            room: "Room 401",
            seat: "A2",
            brand: "HP",
            model: "ProDesk 400 G7",
            cpu: "Intel Core i5-10500",
            ram: "8 GB",
            storage: "256 GB SSD",
            gpu: "Integrated",
            os: "Windows 11",
            availability: "In Use",
            assignedUser: "USR-001"
        },

        {
            id: "PC-003",
            room: "Room 401",
            seat: "A3",
            brand: "Lenovo",
            model: "ThinkCentre M720",
            cpu: "Intel Core i5-8500",
            ram: "8 GB",
            storage: "1 TB HDD",
            gpu: "Integrated",
            os: "Windows 10",
            availability: "Maintenance",
            assignedUser: ""
        },

        {
            id: "PC-004",
            room: "Room 402",
            seat: "A1",
            brand: "Acer",
            model: "Veriton X",
            cpu: "Intel Core i3-10100",
            ram: "8 GB",
            storage: "256 GB SSD",
            gpu: "Integrated",
            os: "Windows 10",
            availability: "Available",
            assignedUser: ""
        }

    ],


    rooms: [

        {
            id: "Room 401",
            name: "Computer Room 401",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "Maria Santos",
            schedule: "8:00 AM - 5:00 PM"
        },

        {
            id: "Room 402",
            name: "Computer Room 402",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "Juan Dela Cruz",
            schedule: "8:00 AM - 5:00 PM"
        },

        {
            id: "Room 403",
            name: "Computer Room 403",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "",
            schedule: "8:00 AM - 5:00 PM"
        },

        {
            id: "Room 404",
            name: "Computer Room 404",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "",
            schedule: "8:00 AM - 5:00 PM"
        },

        {
            id: "Room 405",
            name: "Computer Room 405",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "",
            schedule: "8:00 AM - 5:00 PM"
        },

        {
            id: "Room 406",
            name: "Computer Room 406",
            location: "Main Building - 4th Floor",
            capacity: 50,
            assignedUser: "",
            schedule: "8:00 AM - 5:00 PM"
        }

    ],


    users: [

        {
            id: "USR-001",
            name: "Maria Santos",
            role: "Teacher",
            department: "ICT Department",
            room: "Room 401",
            computer: "PC-002"
        },

        {
            id: "USR-002",
            name: "Andrea Reyes",
            role: "Student",
            department: "BSIT 2D",
            room: "Room 401",
            computer: "",
            username: "andrea",
            seedPassword: "student123"
        }

    ],


    /*
        Built-in administrator account.
        seedPassword is hashed on first load (see auth.js).
    */

    admins: [

        {
            id: "ADM-001",
            name: "Administrator",
            username: "admin",
            seedPassword: "admin123"
        }

    ],


    reservations: [

        {
            id: "RES-001",
            user: "USR-002",
            computer: "PC-001",
            date: "2026-10-20",
            time: "9:00 AM - 11:00 AM",
            purpose: "Programming 2",
            status: "Approved"
        }

    ],


    reports: [

        {
            id: "REP-001",
            computer: "PC-003",
            problem: "Computer does not boot properly.",
            reportedBy: "Juan Dela Cruz",
            date: "2026-10-06",
            status: "Under Maintenance",
            action: "Power supply and RAM inspection scheduled."
        }

    ]

};


/* =========================================================
   LOAD DATA
   ========================================================= */

let data = loadData();


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

            parsed.reservations =
                parsed.reservations || [];

            return parsed;

        }

    } catch (error) {

        console.error(
            "Unable to load data:",
            error
        );

    }

    return structuredClone(sampleData);
}


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data, null, 2)
    );

    renderAll();
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(value = "") {

    return String(value).replace(
        /[&<>"']/g,

        function (character) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return entities[character];

        }
    );
}


/* =========================================================
   NAVIGATION
   Handled in ui.js (role-aware, animated).
   ========================================================= */


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    document.getElementById(
        "totalComputers"
    ).textContent =
        data.computers.length;


    document.getElementById(
        "availableComputers"
    ).textContent =
        data.computers.filter(
            computer =>
                computer.availability === "Available"
        ).length;


    document.getElementById(
        "inUseComputers"
    ).textContent =
        data.computers.filter(
            computer =>
                computer.availability === "In Use"
        ).length;


    document.getElementById(
        "maintenanceComputers"
    ).textContent =
        data.computers.filter(
            computer =>
                computer.availability === "Maintenance"
        ).length;


    document.getElementById(
        "openReports"
    ).textContent =
        data.reports.filter(
            report =>
                report.status !== "Resolved"
        ).length;
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function statusBadge(status) {

    let className = "";

    switch (status) {

        case "Available":
            className = "available";
            break;

        case "In Use":
            className = "in-use";
            break;

        case "Maintenance":
        case "Under Maintenance":
            className = "maintenance";
            break;

        case "Unavailable":
            className = "unavailable";
            break;

        case "Resolved":
            className = "resolved";
            break;

        case "Reported":
            className = "reported";
            break;

        default:
            className = "unavailable";

    }


    return `
        <span class="badge ${className}">
            ${escapeHTML(status)}
        </span>
    `;
}


/* =========================================================
   COMPUTER CRUD
   ========================================================= */

function renderComputers() {

    const search =
        document
            .getElementById("computerSearch")
            .value
            .toLowerCase();


    const computers =
        data.computers.filter(
            computer =>

                Object
                    .values(computer)
                    .join(" ")
                    .toLowerCase()
                    .includes(search)
        );


    const table =
        document.getElementById(
            "computerTable"
        );


    if (computers.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No computers found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        computers.map(computer => `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(computer.id)}
                    </strong>

                    <br>

                    ${escapeHTML(computer.brand)}
                    ${escapeHTML(computer.model)}

                </td>


                <td>
                    ${escapeHTML(computer.room)}

                    <br>

                    <small class="login-tag">
                        Seat ${escapeHTML(computer.seat || "—")}
                    </small>
                </td>


                <td>

                    <strong>CPU:</strong>
                    ${escapeHTML(computer.cpu)}

                    <br>

                    <strong>RAM:</strong>
                    ${escapeHTML(computer.ram)}

                    <br>

                    <strong>Storage:</strong>
                    ${escapeHTML(computer.storage)}

                    <br>

                    <strong>GPU:</strong>
                    ${escapeHTML(computer.gpu)}

                    <br>

                    <strong>OS:</strong>
                    ${escapeHTML(computer.os)}

                </td>


                <td>
                    ${statusBadge(
                        computer.availability
                    )}
                </td>


                <td>

                    ${
                        computer.assignedUser
                            ? escapeHTML(
                                getUserName(
                                    computer.assignedUser
                                )
                              )
                            : "—"
                    }

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editComputer('${computer.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteComputer('${computer.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   COMPUTER MODAL
   ========================================================= */

function openComputerModal(existing = null, preset = {}) {

    const computer = existing || {

        id: "",
        room: preset.room || "",
        seat: preset.seat || "",
        brand: "",
        model: "",
        cpu: "",
        ram: "",
        storage: "",
        gpu: "",
        os: "Windows 11",
        availability: "Available",
        assignedUser: ""

    };


    openModal(

        existing
            ? "Edit Computer"
            : "Add Computer",

        `

        <div class="form-grid">

            <div class="field">

                <label>
                    Computer ID *
                </label>

                <input
                    name="id"
                    value="${escapeHTML(computer.id)}"
                    required
                    ${existing ? "readonly" : ""}
                >

            </div>


            <div class="field">

                <label>
                    Room *
                </label>

                <select name="room" required>

                    ${roomOptions(
                        computer.room
                    )}

                </select>

            </div>


            <div class="field">

                <label>
                    Seat
                </label>

                <input
                    name="seat"
                    value="${escapeHTML(computer.seat || "")}"
                    placeholder="e.g. A1 — blank = next free seat"
                    autocomplete="off"
                >

            </div>


            <div class="field">

                <label>
                    Brand *
                </label>

                <input
                    name="brand"
                    value="${escapeHTML(computer.brand)}"
                    required
                >

            </div>


            <div class="field">

                <label>
                    Model *
                </label>

                <input
                    name="model"
                    value="${escapeHTML(computer.model)}"
                    required
                >

            </div>


            <div class="field">

                <label>
                    Processor / CPU
                </label>

                <input
                    name="cpu"
                    value="${escapeHTML(computer.cpu)}"
                >

            </div>


            <div class="field">

                <label>
                    RAM
                </label>

                <input
                    name="ram"
                    value="${escapeHTML(computer.ram)}"
                >

            </div>


            <div class="field">

                <label>
                    Storage
                </label>

                <input
                    name="storage"
                    value="${escapeHTML(computer.storage)}"
                >

            </div>


            <div class="field">

                <label>
                    Graphics / GPU
                </label>

                <input
                    name="gpu"
                    value="${escapeHTML(computer.gpu)}"
                >

            </div>


            <div class="field">

                <label>
                    Operating System
                </label>

                <input
                    name="os"
                    value="${escapeHTML(computer.os)}"
                >

            </div>


            <div class="field">

                <label>
                    Availability
                </label>

                <select name="availability">

                    <option
                        ${computer.availability === "Available"
                            ? "selected"
                            : ""}
                    >
                        Available
                    </option>

                    <option
                        ${computer.availability === "In Use"
                            ? "selected"
                            : ""}
                    >
                        In Use
                    </option>

                    <option
                        ${computer.availability === "Maintenance"
                            ? "selected"
                            : ""}
                    >
                        Maintenance
                    </option>

                    <option
                        ${computer.availability === "Unavailable"
                            ? "selected"
                            : ""}
                    >
                        Unavailable
                    </option>

                </select>

            </div>


            <div class="field full">

                <label>
                    Assigned User
                </label>

                <select name="assignedUser">

                    ${userOptions(
                        computer.assignedUser
                    )}

                </select>

            </div>

        </div>


        <div class="form-actions">

            <button
                type="button"
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button type="submit">
                Save Computer
            </button>

        </div>

        `
    );


    document
        .getElementById("modalForm")
        .onsubmit = function (event) {

            event.preventDefault();


            const formData =
                new FormData(this);


            const object =
                Object.fromEntries(
                    formData.entries()
                );


            /*
                Seat position (e.g. "A1").
                Blank = next free seat (see ensureSeats in ui.js).
            */

            object.seat =
                object.seat.trim().toUpperCase();


            if (
                object.seat &&
                !isValidSeat(object.seat)
            ) {

                showAlert(
                    `Seat must be a row A–${SEAT_ROWS.at(-1)} and a number 1–${SEATS_PER_ROW}, e.g. A1.`
                );

                return;

            }


            if (
                object.seat &&
                data.computers.some(
                    computer =>
                        computer.id !== object.id &&
                        computer.room === object.room &&
                        computer.seat === object.seat
                )
            ) {

                showAlert(
                    `Seat ${object.seat} in ${object.room} already has a computer.`
                );

                return;

            }


            if (existing) {

                Object.assign(
                    existing,
                    object
                );

            } else {

                if (
                    data.computers.some(
                        computer =>
                            computer.id === object.id
                    )
                ) {

                    showAlert(
                        "Computer ID already exists."
                    );

                    return;
                }


                data.computers.push(object);

            }


            saveData();

            closeModal();

        };

}


/* =========================================================
   EDIT COMPUTER
   ========================================================= */

function editComputer(id) {

    const computer =
        data.computers.find(
            computer =>
                computer.id === id
        );


    if (computer) {

        openComputerModal(
            computer
        );

    }

}


/* =========================================================
   DELETE COMPUTER
   ========================================================= */

async function deleteComputer(id) {

    if (
        !await askConfirm(
            `${id} will be removed from its desk and unassigned from any user. This can't be undone.`,
            { title: "Delete computer?", confirmText: "Delete", danger: true }
        )
    ) {

        return;

    }


    data.computers =
        data.computers.filter(
            computer =>
                computer.id !== id
        );


    data.users.forEach(
        user => {

            if (
                user.computer === id
            ) {

                user.computer = "";

            }

        }
    );


    saveData();

}


/* =========================================================
   ROOM CRUD
   ========================================================= */

function renderRooms() {

    const table =
        document.getElementById(
            "roomTable"
        );


    if (data.rooms.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    No rooms found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.rooms.map(room => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(room.id)}
                    </strong>
                </td>


                <td>
                    ${escapeHTML(room.name)}
                </td>


                <td>
                    ${escapeHTML(room.location)}
                </td>


                <td>
                    ${escapeHTML(room.capacity)}
                </td>


                <td>
                    ${escapeHTML(
                        room.assignedUser || "—"
                    )}
                </td>


                <td>
                    ${escapeHTML(room.schedule)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editRoom('${room.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteRoom('${room.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   ROOM MODAL
   ========================================================= */

function openRoomModal(existing = null) {

    const room = existing || {

        id: "",
        name: "",
        location: "",
        capacity: "",
        assignedUser: "",
        schedule: ""

    };


    openModal(

        existing
            ? "Edit Computer Room"
            : "Add Computer Room",

        `

        <div class="form-grid">

            <div class="field">

                <label>
                    Room ID *
                </label>

                <input
                    name="id"
                    value="${escapeHTML(room.id)}"
                    required
                    ${existing ? "readonly" : ""}
                >

            </div>


            <div class="field">

                <label>
                    Room Name *
                </label>

                <input
                    name="name"
                    value="${escapeHTML(room.name)}"
                    required
                >

            </div>


            <div class="field full">

                <label>
                    Location
                </label>

                <input
                    name="location"
                    value="${escapeHTML(room.location)}"
                >

            </div>


            <div class="field">

                <label>
                    Capacity
                </label>

                <input
                    type="number"
                    min="1"
                    name="capacity"
                    value="${escapeHTML(room.capacity)}"
                >

            </div>


            <div class="field">

                <label>
                    Assigned Teacher
                </label>

                <input
                    name="assignedUser"
                    value="${escapeHTML(room.assignedUser)}"
                >

            </div>


            <div class="field full">

                <label>
                    Schedule
                </label>

                <input
                    name="schedule"
                    value="${escapeHTML(room.schedule)}"
                >

            </div>

        </div>


        <div class="form-actions">

            <button
                type="button"
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button type="submit">
                Save Room
            </button>

        </div>

        `
    );


    document
        .getElementById("modalForm")
        .onsubmit = function (event) {

            event.preventDefault();


            const formData =
                new FormData(this);


            const object =
                Object.fromEntries(
                    formData.entries()
                );


            object.capacity =
                Number(
                    object.capacity || 0
                );


            if (existing) {

                Object.assign(
                    existing,
                    object
                );

            } else {

                if (
                    data.rooms.some(
                        room =>
                            room.id === object.id
                    )
                ) {

                    showAlert(
                        "Room ID already exists."
                    );

                    return;

                }


                data.rooms.push(object);

            }


            saveData();

            closeModal();

        };

}


/* =========================================================
   EDIT ROOM
   ========================================================= */

function editRoom(id) {

    const room =
        data.rooms.find(
            room =>
                room.id === id
        );


    if (room) {

        openRoomModal(room);

    }

}


/* =========================================================
   DELETE ROOM
   ========================================================= */

async function deleteRoom(id) {

    if (
        !await askConfirm(
            `${id} will be removed. Its computers and users will stay in the system but will no longer have a room.`,
            { title: `Delete ${id}?`, confirmText: "Delete room", danger: true }
        )
    ) {

        return;

    }


    data.rooms =
        data.rooms.filter(
            room =>
                room.id !== id
        );


    data.computers.forEach(
        computer => {

            if (
                computer.room === id
            ) {

                computer.room = "";

            }

        }
    );


    data.users.forEach(
        user => {

            if (
                user.room === id
            ) {

                user.room = "";

            }

        }
    );


    saveData();

}


/* =========================================================
   USER CRUD
   ========================================================= */

function renderUsers() {

    const table =
        document.getElementById(
            "userTable"
        );


    if (data.users.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    No users found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.users.map(user => `

            <tr>

                <td>
                    ${escapeHTML(user.id)}
                </td>


                <td>
                    <strong>
                        ${escapeHTML(user.name)}
                    </strong>

                    <br>

                    <small class="login-tag ${user.password ? "" : "none"}">
                        ${user.username
                            ? "@" + escapeHTML(user.username)
                            : "No login"}
                        ${user.username && !user.password
                            ? " · no password"
                            : ""}
                    </small>
                </td>


                <td>
                    ${escapeHTML(user.role)}
                </td>


                <td>
                    ${escapeHTML(user.department)}
                </td>


                <td>
                    ${escapeHTML(user.room || "—")}
                </td>


                <td>
                    ${escapeHTML(user.computer || "—")}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editUser('${user.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="secondary-button"
                            onclick="openPasswordReset('${user.id}')"
                        >
                            Password
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteUser('${user.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   USER MODAL
   ========================================================= */

function openUserModal(existing = null) {

    const user = existing || {

        id: "",
        name: "",
        role: "Student",
        department: "",
        room: "",
        computer: ""

    };


    openModal(

        existing
            ? "Edit Assigned User"
            : "Add Assigned User",

        `

        <div class="form-grid">

            <div class="field">

                <label>
                    User ID *
                </label>

                <input
                    name="id"
                    value="${escapeHTML(user.id)}"
                    required
                    ${existing ? "readonly" : ""}
                >

            </div>


            <div class="field">

                <label>
                    Full Name *
                </label>

                <input
                    name="name"
                    value="${escapeHTML(user.name)}"
                    required
                >

            </div>


            <div class="field">

                <label>
                    Role
                </label>

                <select name="role">

                    <option
                        ${user.role === "Student"
                            ? "selected"
                            : ""}
                    >
                        Student
                    </option>

                    <option
                        ${user.role === "Teacher"
                            ? "selected"
                            : ""}
                    >
                        Teacher
                    </option>

                    <option
                        ${user.role === "Staff"
                            ? "selected"
                            : ""}
                    >
                        Staff
                    </option>

                    <option
                        ${user.role === "Administrator"
                            ? "selected"
                            : ""}
                    >
                        Administrator
                    </option>

                </select>

            </div>


            <div class="field">

                <label>
                    Login Username
                </label>

                <input
                    name="username"
                    value="${escapeHTML(user.username || "")}"
                    placeholder="e.g. jdelacruz"
                    autocomplete="off"
                >

            </div>


            <div class="field">

                <label>
                    Department / Section
                </label>

                <input
                    name="department"
                    value="${escapeHTML(user.department)}"
                >

            </div>


            <div class="field">

                <label>
                    Computer Room
                </label>

                <select name="room">

                    ${roomOptions(
                        user.room
                    )}

                </select>

            </div>


            <div class="field">

                <label>
                    Assigned Computer
                </label>

                <select name="computer">

                    ${computerOptions(
                        user.computer
                    )}

                </select>

            </div>

        </div>


        <div class="form-actions">

            <button
                type="button"
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button type="submit">
                Save User
            </button>

        </div>

        `
    );


    document
        .getElementById("modalForm")
        .onsubmit = function (event) {

            event.preventDefault();


            const formData =
                new FormData(this);


            const object =
                Object.fromEntries(
                    formData.entries()
                );


            object.username =
                object.username.trim().toLowerCase();


            if (
                object.username &&
                !isUsernameFree(object.username, object.id)
            ) {

                showAlert(
                    "That username is already taken."
                );

                return;

            }


            if (existing) {

                Object.assign(
                    existing,
                    object
                );

            } else {

                if (
                    data.users.some(
                        user =>
                            user.id === object.id
                    )
                ) {

                    showAlert(
                        "User ID already exists."
                    );

                    return;

                }


                data.users.push(object);

            }


            /*
                Remove previous computer
                assignment for this user.
            */

            data.computers.forEach(
                computer => {

                    if (
                        computer.assignedUser === object.id
                    ) {

                        computer.assignedUser = "";

                        computer.availability =
                            "Available";

                    }

                }
            );


            /*
                Assign new computer.
            */

            if (object.computer) {

                const computer =
                    data.computers.find(
                        computer =>
                            computer.id ===
                            object.computer
                    );


                if (computer) {

                    computer.assignedUser =
                        object.id;

                    computer.availability =
                        "In Use";

                }

            }


            saveData();

            closeModal();

        };

}


/* =========================================================
   EDIT USER
   ========================================================= */

function editUser(id) {

    const user =
        data.users.find(
            user =>
                user.id === id
        );


    if (user) {

        openUserModal(user);

    }

}


/* =========================================================
   DELETE USER
   ========================================================= */

async function deleteUser(id) {

    if (
        !await askConfirm(
            `${getUserName(id)} (${id}) will be removed, along with their login. Any computer assigned to them will be freed.`,
            { title: "Delete user?", confirmText: "Delete", danger: true }
        )
    ) {

        return;

    }


    data.users =
        data.users.filter(
            user =>
                user.id !== id
        );


    data.computers.forEach(
        computer => {

            if (
                computer.assignedUser === id
            ) {

                computer.assignedUser = "";

                computer.availability =
                    "Available";

            }

        }
    );


    saveData();

}


/* =========================================================
   MAINTENANCE REPORT CRUD
   ========================================================= */

function renderReports() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (data.reports.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No maintenance reports found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.reports.map(report => `

            <tr>

                <td>
                    ${escapeHTML(report.id)}
                </td>


                <td>
                    ${escapeHTML(report.computer)}
                </td>


                <td>
                    ${escapeHTML(report.problem)}
                </td>


                <td>
                    ${escapeHTML(report.reportedBy)}
                </td>


                <td>
                    ${escapeHTML(report.date)}
                </td>


                <td>
                    ${statusBadge(report.status)}
                </td>


                <td>
                    ${escapeHTML(
                        report.action || "—"
                    )}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editReport('${report.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteReport('${report.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* =========================================================
   REPORT MODAL
   ========================================================= */

function openReportModal(existing = null) {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    const report = existing || {

        id: "",
        computer: "",
        problem: "",
        reportedBy: "",
        date: today,
        status: "Reported",
        action: ""

    };


    openModal(

        existing
            ? "Edit Problem / Maintenance Report"
            : "Add Problem / Maintenance Report",

        `

        <div class="form-grid">

            <div class="field">

                <label>
                    Report ID *
                </label>

                <input
                    name="id"
                    value="${escapeHTML(report.id)}"
                    required
                    ${existing ? "readonly" : ""}
                >

            </div>


            <div class="field">

                <label>
                    Computer *
                </label>

                <select
                    name="computer"
                    required
                >

                    ${computerOptions(
                        report.computer
                    )}

                </select>

            </div>


            <div class="field full">

                <label>
                    Problem *
                </label>

                <textarea
                    name="problem"
                    required
                >${escapeHTML(report.problem)}</textarea>

            </div>


            <div class="field">

                <label>
                    Reported By
                </label>

                <input
                    name="reportedBy"
                    value="${escapeHTML(report.reportedBy)}"
                >

            </div>


            <div class="field">

                <label>
                    Date
                </label>

                <input
                    type="date"
                    name="date"
                    value="${escapeHTML(report.date)}"
                >

            </div>


            <div class="field">

                <label>
                    Status
                </label>

                <select name="status">

                    <option
                        ${report.status === "Reported"
                            ? "selected"
                            : ""}
                    >
                        Reported
                    </option>

                    <option
                        ${report.status === "Under Maintenance"
                            ? "selected"
                            : ""}
                    >
                        Under Maintenance
                    </option>

                    <option
                        ${report.status === "Resolved"
                            ? "selected"
                            : ""}
                    >
                        Resolved
                    </option>

                </select>

            </div>


            <div class="field full">

                <label>
                    Action Taken / Maintenance Notes
                </label>

                <textarea
                    name="action"
                >${escapeHTML(report.action)}</textarea>

            </div>

        </div>


        <div class="form-actions">

            <button
                type="button"
                class="secondary-button"
                onclick="closeModal()"
            >
                Cancel
            </button>

            <button type="submit">
                Save Report
            </button>

        </div>

        `
    );


    document
        .getElementById("modalForm")
        .onsubmit = function (event) {

            event.preventDefault();


            const formData =
                new FormData(this);


            const object =
                Object.fromEntries(
                    formData.entries()
                );


            if (existing) {

                Object.assign(
                    existing,
                    object
                );

            } else {

                if (
                    data.reports.some(
                        report =>
                            report.id === object.id
                    )
                ) {

                    showAlert(
                        "Report ID already exists."
                    );

                    return;

                }


                data.reports.push(object);

            }


            /*
                Automatically update
                computer maintenance status.
            */

            const computer =
                data.computers.find(
                    computer =>
                        computer.id ===
                        object.computer
                );


            if (computer) {

                if (
                    object.status ===
                    "Reported"
                ) {

                    computer.availability =
                        "Maintenance";

                }


                if (
                    object.status ===
                    "Under Maintenance"
                ) {

                    computer.availability =
                        "Maintenance";

                }


                if (
                    object.status ===
                    "Resolved"
                ) {

                    computer.availability =
                        "Available";

                }

            }


            saveData();

            closeModal();

        };

}


/* =========================================================
   EDIT REPORT
   ========================================================= */

function editReport(id) {

    const report =
        data.reports.find(
            report =>
                report.id === id
        );


    if (report) {

        openReportModal(
            report
        );

    }

}


/* =========================================================
   DELETE REPORT
   ========================================================= */

async function deleteReport(id) {

    if (
        !await askConfirm(
            `Report ${id} will be permanently removed from the maintenance log.`,
            { title: "Delete report?", confirmText: "Delete", danger: true }
        )
    ) {

        return;

    }


    data.reports =
        data.reports.filter(
            report =>
                report.id !== id
        );


    saveData();

}


/* =========================================================
   MODAL FUNCTIONS
   ========================================================= */

function openModal(
    title,
    html
) {

    document.getElementById(
        "modalTitle"
    ).textContent = title;


    document.getElementById(
        "modalForm"
    ).innerHTML = html;


    document.getElementById(
        "modal"
    ).classList.add("show");

}


function closeModal() {

    document.getElementById(
        "modal"
    ).classList.remove("show");

}


/* =========================================================
   ROOM OPTIONS
   ========================================================= */

function roomOptions(selected = "") {

    let html = `
        <option value="">
            Select room
        </option>
    `;


    data.rooms.forEach(
        room => {

            html += `

                <option
                    value="${escapeHTML(room.id)}"
                    ${
                        room.id === selected
                            ? "selected"
                            : ""
                    }
                >

                    ${escapeHTML(room.id)}
                    -
                    ${escapeHTML(room.name)}

                </option>

            `;

        }
    );


    return html;

}


/* =========================================================
   USER OPTIONS
   ========================================================= */

function userOptions(selected = "") {

    let html = `
        <option value="">
            No assigned user
        </option>
    `;


    data.users.forEach(
        user => {

            html += `

                <option
                    value="${escapeHTML(user.id)}"
                    ${
                        user.id === selected
                            ? "selected"
                            : ""
                    }
                >

                    ${escapeHTML(user.name)}

                </option>

            `;

        }
    );


    return html;

}


/* =========================================================
   COMPUTER OPTIONS
   ========================================================= */

function computerOptions(
    selected = ""
) {

    let html = `
        <option value="">
            Select computer
        </option>
    `;


    /*
        Grouped by room and sorted by desk (A1, A2 … E10)
        so 300 computers stay easy to scan.
    */

    const deskOrder = seat =>
        seat
            ? seat.charCodeAt(0) * 100 + parseInt(seat.slice(1), 10)
            : 99999;


    const rooms =
        [...new Set(
            data.computers.map(
                computer => computer.room || ""
            )
        )].sort();


    rooms.forEach(
        room => {

            const computers =
                data.computers
                    .filter(
                        computer =>
                            (computer.room || "") === room
                    )
                    .sort(
                        (a, b) =>
                            deskOrder(a.seat) - deskOrder(b.seat)
                    );


            html += `<optgroup label="${escapeHTML(room || "No room")}">`;


            computers.forEach(
                computer => {

                    html += `

                        <option
                            value="${escapeHTML(computer.id)}"
                            ${
                                computer.id === selected
                                    ? "selected"
                                    : ""
                            }
                        >

                            ${escapeHTML(computer.seat || "—")}
                            ·
                            ${escapeHTML(computer.id)}
                            (${escapeHTML(computer.availability)})

                        </option>

                    `;

                }
            );


            html += `</optgroup>`;

        }
    );


    return html;

}


/* =========================================================
   GET USER NAME
   ========================================================= */

function getUserName(userId) {

    const user =
        data.users.find(
            user =>
                user.id === userId
        );


    return user
        ? user.name
        : userId;

}


/* =========================================================
   SEARCH
   ========================================================= */

document
    .getElementById("computerSearch")
    .addEventListener(
        "input",
        renderComputers
    );


/* =========================================================
   EXPORT JSON
   ========================================================= */

function exportJSON() {

    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "computer-laboratory-data.json";


    link.click();


    URL.revokeObjectURL(url);

}


/* =========================================================
   IMPORT JSON
   ========================================================= */

document
    .getElementById("importFile")
    .addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const importedData =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !importedData.computers ||
                            !importedData.rooms ||
                            !importedData.users ||
                            !importedData.reports
                        ) {

                            throw new Error(
                                "Invalid structure"
                            );

                        }


                        importedData.reservations =
                            importedData.reservations || [];


                        /*
                            Older files have no admin account:
                            keep the current one (and its password).
                        */

                        if (
                            !Array.isArray(importedData.admins) ||
                            !importedData.admins.length
                        ) {

                            importedData.admins =
                                data.admins;

                        }


                        data =
                            importedData;


                        saveData();


                        toast(
                            "JSON data imported successfully."
                        );


                    } catch (error) {

                        showAlert(
                            "Invalid JSON file."
                        );

                    }


                    event.target.value = "";

                };


            reader.readAsText(file);

        }
    );


/* =========================================================
   RESTORE SAMPLE DATA
   ========================================================= */

async function restoreSampleData() {

    const confirmed =
        await askConfirm(
            "All current records will be replaced with the sample data. Export JSON first if you want a backup.",
            { title: "Restore sample data?", confirmText: "Restore", danger: true, icon: "refresh" }
        );


    if (!confirmed) {

        return;

    }


    /*
        Keep the admin account (and its password) so
        restoring records doesn't reset admin sign-in.
    */

    const admins =
        data.admins;


    data =
        structuredClone(
            sampleData
        );


    if (admins && admins.length) {

        data.admins = admins;

    }


    saveData();

}


/* =========================================================
   CLOSE MODAL WITH ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   INITIAL RENDER
   ========================================================= */

function renderAll() {

    renderDashboard();

    renderComputers();

    renderRooms();

    renderUsers();

    renderReports();

}


renderAll();