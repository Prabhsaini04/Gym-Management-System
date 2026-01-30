// Sample data for the gym management system
const membersData = [
    { id: 1, name: "John Smith", email: "john@example.com", phone: "(555) 123-4567", membership: "Premium", joinDate: "2023-01-15", status: "Active" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "(555) 234-5678", membership: "Elite", joinDate: "2023-02-10", status: "Active" },
    { id: 3, name: "Michael Brown", email: "michael@example.com", phone: "(555) 345-6789", membership: "Standard", joinDate: "2023-03-05", status: "Inactive" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "(555) 456-7890", membership: "Basic", joinDate: "2023-04-20", status: "Active" },
    { id: 5, name: "David Wilson", email: "david@example.com", phone: "(555) 567-8901", membership: "Premium", joinDate: "2023-05-12", status: "Active" },
    { id: 6, name: "Lisa Anderson", email: "lisa@example.com", phone: "(555) 678-9012", membership: "Elite", joinDate: "2023-06-18", status: "Active" },
    { id: 7, name: "Robert Taylor", email: "robert@example.com", phone: "(555) 789-0123", membership: "Standard", joinDate: "2023-07-22", status: "Inactive" },
    { id: 8, name: "Jennifer Lee", email: "jennifer@example.com", phone: "(555) 890-1234", membership: "Premium", joinDate: "2023-08-30", status: "Active" }
];

const workoutsData = [
    { id: 1, name: "Morning Yoga", time: "6:00 AM - 7:00 AM", capacity: 20, enrolled: 18, trainer: "Emma Wilson", difficulty: "Beginner" },
    { id: 2, name: "HIIT Training", time: "8:00 AM - 9:00 AM", capacity: 15, enrolled: 15, trainer: "James Miller", difficulty: "Advanced" },
    { id: 3, name: "Spin Class", time: "10:00 AM - 11:00 AM", capacity: 25, enrolled: 22, trainer: "Sophia Clark", difficulty: "Intermediate" },
    { id: 4, name: "Strength Training", time: "4:00 PM - 5:00 PM", capacity: 18, enrolled: 16, trainer: "Daniel White", difficulty: "Intermediate" },
    { id: 5, name: "Zumba Dance", time: "6:00 PM - 7:00 PM", capacity: 30, enrolled: 28, trainer: "Olivia Martinez", difficulty: "Beginner" },
    { id: 6, name: "Boxing Workout", time: "7:30 PM - 8:30 PM", capacity: 20, enrolled: 20, trainer: "William Davis", difficulty: "Advanced" }
];

const paymentsData = [
    { id: 1, member: "John Smith", amount: "$79", dueDate: "2023-10-05", status: "Paid", avatar: "JS" },
    { id: 2, member: "Sarah Johnson", amount: "$99", dueDate: "2023-10-10", status: "Pending", avatar: "SJ" },
    { id: 3, member: "Michael Brown", amount: "$49", dueDate: "2023-10-01", status: "Overdue", avatar: "MB" },
    { id: 4, member: "Emily Davis", amount: "$29", dueDate: "2023-10-15", status: "Paid", avatar: "ED" },
    { id: 5, member: "David Wilson", amount: "$79", dueDate: "2023-10-12", status: "Pending", avatar: "DW" },
    { id: 6, member: "Lisa Anderson", amount: "$99", dueDate: "2023-10-08", status: "Paid", avatar: "LA" },
    { id: 7, member: "Robert Taylor", amount: "$49", dueDate: "2023-09-28", status: "Overdue", avatar: "RT" },
    { id: 8, member: "Jennifer Lee", amount: "$79", dueDate: "2023-10-20", status: "Pending", avatar: "JL" }
];

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

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected page
            pageSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === pageId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Render initial data
    renderMembersTable(membersData);
    renderWorkoutCards(workoutsData);
    renderPaymentCards(paymentsData);
    setupCharts();
    
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
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            memberModal.style.display = 'none';
            memberForm.reset();
        }
    });
    
    // Form submission
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const phone = document.getElementById('member-phone').value;
        const plan = document.getElementById('member-plan').value;
        const status = document.getElementById('member-status').value;
        
        // Create new member object
        const newMember = {
            id: membersData.length + 1,
            name: name,
            email: email,
            phone: phone,
            membership: plan.split(' ')[0],
            joinDate: new Date().toISOString().split('T')[0],
            status: status
        };
        
        // Add to data array
        membersData.unshift(newMember);
        
        // Update table
        renderMembersTable(membersData);
        
        // Update dashboard stats
        document.getElementById('total-members').textContent = membersData.length;
        
        // Close modal and reset form
        memberModal.style.display = 'none';
        memberForm.reset();
        
        // Show success message
        alert('Member added successfully!');
    });
    
    // Payment filter functionality
    paymentFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Update active filter
            paymentFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            const filterType = this.getAttribute('data-filter');
            let filteredPayments = paymentsData;
            
            if (filterType !== 'all') {
                filteredPayments = paymentsData.filter(payment => 
                    payment.status.toLowerCase() === filterType.toLowerCase()
                );
            }
            
            renderPaymentCards(filteredPayments);
        });
    });
    
    // Member search functionality
    memberSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredMembers = membersData.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.phone.includes(searchTerm)
        );
        
        renderMembersTable(filteredMembers);
    });
});

// Render members table
function renderMembersTable(members) {
    membersTableBody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.membership}</td>
            <td>${member.joinDate}</td>
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
        card.className = `payment-card ${statusClass}`;
        card.innerHTML = `
            <div class="payment-header">
                <div class="payment-amount">${payment.amount}</div>
                <div class="payment-status status-${statusClass}">${payment.status}</div>
            </div>
            <div class="payment-member">
                <div class="member-avatar">${payment.avatar}</div>
                <div>
                    <div style="font-weight: 600;">${payment.member}</div>
                    <div style="font-size: 0.9rem; color: #666;">Due: ${payment.dueDate}</div>
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
    const attendanceData = [45, 52, 48, 65, 72, 68, 80, 75, 82, 78, 85, 90];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    attendanceData.forEach((value, index) => {
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
    const membershipData = [
        { type: 'Basic', count: 35, color: '#3e92cc' },
        { type: 'Standard', count: 42, color: '#0a2463' },
        { type: 'Premium', count: 28, color: '#ff6b6b' },
        { type: 'Elite', count: 23, color: '#4caf50' }
    ];
    
    membershipData.forEach(item => {
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