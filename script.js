// Gym Management System — frontend
// Members, fees (payments), and attendance are fetched from the backend API
// (backed by MySQL). Workouts remain static/demo data (out of current scope).

const API_BASE = '/api';

const workoutsData = [
    { id: 1, name: "Morning Yoga", time: "6:00 AM - 7:00 AM", capacity: 20, enrolled: 18, trainer: "Emma Wilson", difficulty: "Beginner" },
    { id: 2, name: "HIIT Training", time: "8:00 AM - 9:00 AM", capacity: 15, enrolled: 15, trainer: "James Miller", difficulty: "Advanced" },
    { id: 3, name: "Spin Class", time: "10:00 AM - 11:00 AM", capacity: 25, enrolled: 22, trainer: "Sophia Clark", difficulty: "Intermediate" },
    { id: 4, name: "Strength Training", time: "4:00 PM - 5:00 PM", capacity: 18, enrolled: 16, trainer: "Daniel White", difficulty: "Intermediate" },
    { id: 5, name: "Zumba Dance", time: "6:00 PM - 7:00 PM", capacity: 30, enrolled: 28, trainer: "Olivia Martinez", difficulty: "Beginner" },
    { id: 6, name: "Boxing Workout", time: "7:30 PM - 8:30 PM", capacity: 20, enrolled: 20, trainer: "William Davis", difficulty: "Advanced" }
];

let membersData = [];
let feesData = [];
let attendanceData = [];

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const addMemberBtn = document.getElementById('add-member-btn');
const memberModal = document.getElementById('member-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const memberForm = document.getElementById('member-form');
const membersTableBody = document.getElementById('members-table-body');
const workoutCardsContainer = document.getElementById('workout-cards-container');
const paymentCardsContainer = document.getElementById('payment-cards-container');
const paymentFilters = document.querySelectorAll('.filter-btn');
const memberSearch = document.getElementById('member-search');
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceMemberSelect = document.getElementById('attendance-member-select');
const logAttendanceBtn = document.getElementById('log-attendance-btn');

async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `POST ${path} failed: ${res.status}`);
    return data;
}

async function loadMembers() {
    membersData = await apiGet('/members');
    renderMembersTable(membersData);
    renderMemberSelect(membersData);
    const totalMembersEl = document.getElementById('total-members');
    if (totalMembersEl) totalMembersEl.textContent = membersData.length;
}

async function loadFees() {
    feesData = await apiGet('/fees');
    renderPaymentCards(feesData);
}

async function loadAttendance() {
    attendanceData = await apiGet('/attendance');
    renderAttendanceTable(attendanceData);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');

            navLinks.forEach(item => item.classList.remove('active'));
            document.querySelectorAll(`.nav-link[data-page="${pageId}"]`).forEach(l => l.classList.add('active'));

            pageSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === pageId) {
                    section.classList.add('active');
                }
            });
        });
    });

    renderWorkoutCards(workoutsData);
    setupCharts();

    try {
        await Promise.all([loadMembers(), loadFees(), loadAttendance()]);
    } catch (err) {
        console.error(err);
        alert('Could not load data from the server. Is the backend running (npm start in backend/)?');
    }

    // Modal functionality
    addMemberBtn.addEventListener('click', () => {
        memberModal.style.display = 'flex';
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            memberModal.style.display = 'none';
            memberForm.reset();
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            memberModal.style.display = 'none';
            memberForm.reset();
        }
    });

    // Form submission
    memberForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const full_name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const phone = document.getElementById('member-phone').value;
        const plan_name = document.getElementById('member-plan').value;
        const status = document.getElementById('member-status').value;

        try {
            await apiPost('/members', { full_name, email, phone, plan_name, status });
            await loadMembers();
            memberModal.style.display = 'none';
            memberForm.reset();
            alert('Member added successfully!');
        } catch (err) {
            alert(`Could not add member: ${err.message}`);
        }
    });

    // Payment filter functionality
    paymentFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            paymentFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.getAttribute('data-filter');
            let filteredPayments = feesData;

            if (filterType !== 'all') {
                filteredPayments = feesData.filter(fee =>
                    fee.status.toLowerCase() === filterType.toLowerCase()
                );
            }

            renderPaymentCards(filteredPayments);
        });
    });

    // Member search functionality
    memberSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredMembers = membersData.filter(member =>
            member.full_name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.phone.includes(searchTerm)
        );

        renderMembersTable(filteredMembers);
    });

    // Attendance: log a check-in for the selected member, right now
    if (logAttendanceBtn) {
        logAttendanceBtn.addEventListener('click', async function() {
            const memberId = attendanceMemberSelect.value;
            if (!memberId) {
                alert('Select a member first.');
                return;
            }
            const now = new Date();
            const check_in_date = now.toISOString().split('T')[0];
            const check_in_time = now.toTimeString().split(' ')[0];

            try {
                await apiPost('/attendance', { member_id: memberId, check_in_date, check_in_time });
                await loadAttendance();
            } catch (err) {
                alert(`Could not log attendance: ${err.message}`);
            }
        });
    }
});

// Render members table
function renderMembersTable(members) {
    membersTableBody.innerHTML = '';

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.full_name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.plan_name || 'N/A'}</td>
            <td>${formatDate(member.join_date)}</td>
            <td>${formatDate(member.membership_end)}</td>
            <td><span class="status ${member.status === 'Active' ? 'status-active' : 'status-inactive'}">${member.status}</span></td>
            <td>
                <button class="action-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                <button class="action-btn" title="View Details"><i class="fas fa-eye"></i></button>
            </td>
        `;
        membersTableBody.appendChild(row);
    });
}

function renderMemberSelect(members) {
    if (!attendanceMemberSelect) return;
    attendanceMemberSelect.innerHTML = members
        .map(m => `<option value="${m.id}">${m.full_name}</option>`)
        .join('');
}

function renderAttendanceTable(records) {
    if (!attendanceTableBody) return;
    attendanceTableBody.innerHTML = '';

    records.forEach(rec => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rec.member_name}</td>
            <td>${formatDate(rec.check_in_date)}</td>
            <td>${rec.check_in_time || ''}</td>
            <td>${rec.check_out_time || '—'}</td>
        `;
        attendanceTableBody.appendChild(row);
    });
}

function formatDate(value) {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().split('T')[0];
}

// Render workout cards
function renderWorkoutCards(workouts) {
    workoutCardsContainer.innerHTML = '';

    workouts.forEach(workout => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
            <div class="workout-header">
                <h3>${workout.name}</h3>
                <div class="workout-time">
                    <i class="far fa-clock"></i>
                    <span>${workout.time}</span>
                </div>
            </div>
            <div class="workout-body">
                <div class="workout-info">
                    <div class="workout-info-item">
                        <div class="value">${workout.capacity}</div>
                        <div class="label">Capacity</div>
                    </div>
                    <div class="workout-info-item">
                        <div class="value">${workout.enrolled}</div>
                        <div class="label">Enrolled</div>
                    </div>
                    <div class="workout-info-item">
                        <div class="value">${workout.difficulty}</div>
                        <div class="label">Level</div>
                    </div>
                </div>
                <div class="workout-trainer">
                    <div class="trainer-avatar">${workout.trainer.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                        <div style="font-weight: 600;">${workout.trainer}</div>
                        <div style="font-size: 0.9rem; color: #666;">Trainer</div>
                    </div>
                </div>
            </div>
        `;
        workoutCardsContainer.appendChild(card);
    });
}

// Render payment cards
function renderPaymentCards(payments) {
    paymentCardsContainer.innerHTML = '';

    payments.forEach(payment => {
        const card = document.createElement('div');
        const statusClass = payment.status.toLowerCase();
        const avatar = payment.member_name.split(' ').map(n => n[0]).join('');
        card.className = `payment-card ${statusClass}`;
        card.innerHTML = `
            <div class="payment-header">
                <div class="payment-amount">$${Number(payment.amount).toFixed(0)}</div>
                <div class="payment-status status-${statusClass}">${payment.status}</div>
            </div>
            <div class="payment-member">
                <div class="member-avatar">${avatar}</div>
                <div>
                    <div style="font-weight: 600;">${payment.member_name}</div>
                    <div style="font-size: 0.9rem; color: #666;">Due: ${formatDate(payment.due_date)}</div>
                </div>
            </div>
            <button class="btn" style="width: 100%; margin-top: 1rem; padding: 0.5rem;">
                ${payment.status === 'Paid' ? 'View Receipt' : 'Process Payment'}
            </button>
        `;
        paymentCardsContainer.appendChild(card);
    });
}

// Setup charts
function setupCharts() {
    // Attendance chart
    const attendanceChart = document.getElementById('attendance-chart');
    const attendanceChartData = [45, 52, 48, 65, 72, 68, 80, 75, 82, 78, 85, 90];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    attendanceChartData.forEach((value, index) => {
        const barHeight = (value / 100) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${barHeight}%`;
        bar.innerHTML = `
            <div class="bar-value">${value}</div>
            <div class="bar-label">${months[index]}</div>
        `;
        attendanceChart.appendChild(bar);
    });

    // Membership chart
    const membershipChart = document.getElementById('membership-chart');
    const membershipChartData = [
        { type: 'Basic', count: 35, color: '#3e92cc' },
        { type: 'Standard', count: 42, color: '#0a2463' },
        { type: 'Premium', count: 28, color: '#ff6b6b' },
        { type: 'Elite', count: 23, color: '#4caf50' }
    ];

    membershipChartData.forEach(item => {
        const barHeight = (item.count / 50) * 100;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${barHeight}%`;
        bar.style.background = `linear-gradient(to top, ${item.color}, ${item.color}99)`;
        bar.innerHTML = `
            <div class="bar-value">${item.count}</div>
            <div class="bar-label">${item.type}</div>
        `;
        membershipChart.appendChild(bar);
    });
}
