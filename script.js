// ==========================================
// NeighborSolve - Main JavaScript File
// ==========================================

// Global Variables
let map, reportMap, feedMap, contactMap;
let currentIssue = null;
let issues = [];
let markers = [];

// ==========================================
// Utility Functions
// ==========================================

// Generate unique ID
function generateId() {
    return 'NS-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(3, '0');
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'reported': 'danger',
        'progress': 'warning', 
        'resolved': 'success'
    };
    return colors[status] || 'secondary';
}

// Get problem icon
function getProblemIcon(type) {
    const icons = {
        'pothole': 'fas fa-road',
        'streetlight': 'fas fa-lightbulb',
        'water': 'fas fa-tint',
        'garbage': 'fas fa-trash',
        'safety': 'fas fa-shield-alt',
        'noise': 'fas fa-volume-up',
        'traffic': 'fas fa-car',
        'vandalism': 'fas fa-hammer',
        'other': 'fas fa-exclamation-circle'
    };
    return icons[type] || 'fas fa-exclamation-circle';
}

// ==========================================
// Local Storage Functions
// ==========================================

function saveIssues() {
    localStorage.setItem('neighborsolve_issues', JSON.stringify(issues));
}

function loadIssues() {
    const saved = localStorage.getItem('neighborsolve_issues');
    if (saved) {
        issues = JSON.parse(saved);
    } else {
        // Demo data
        issues = [
            {
                id: 'NS-2024-001',
                type: 'pothole',
                description: 'Large pothole on Main Street causing damage to vehicles',
                location: { lat: 40.7128, lng: -74.0060, address: 'Main Street & 1st Ave' },
                status: 'progress',
                urgency: 'high',
                reporter: { name: 'John Doe', email: 'john@example.com' },
                dateReported: '2024-11-25',
                upvotes: 15,
                department: 'roads'
            },
            {
                id: 'NS-2024-002',
                type: 'streetlight',
                description: 'Streetlight out at park entrance, safety concern',
                location: { lat: 40.7580, lng: -73.9855, address: 'Central Park Entrance' },
                status: 'resolved',
                urgency: 'medium',
                reporter: { name: 'Jane Smith', email: 'jane@example.com' },
                dateReported: '2024-11-20',
                upvotes: 8,
                department: 'utilities'
            }
        ];
        saveIssues();
    }
}

// ==========================================
// Theme Management
// ==========================================

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(themeIcon, currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(themeIcon, newTheme);
        });
    }
}

function updateThemeIcon(icon, theme) {
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ==========================================
// Animation Functions
// ==========================================

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
}

function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
    });
}

// ==========================================
// Map Functions
// ==========================================

function initializeMap(containerId, lat = 40.7128, lng = -74.0060) {
    if (!document.getElementById(containerId)) return null;
    
    const mapInstance = L.map(containerId).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    return mapInstance;
}

function addMarkerToMap(mapInstance, lat, lng, popupContent) {
    if (!mapInstance) return;
    
    const marker = L.marker([lat, lng]).addTo(mapInstance);
    if (popupContent) {
        marker.bindPopup(popupContent);
    }
    return marker;
}

// ==========================================
// Report Page Functions
// ==========================================

function initializeReportPage() {
    if (!document.getElementById('reportForm')) return;
    
    // Initialize map
    reportMap = initializeMap('reportMap');
    
    // Handle form submission
    const form = document.getElementById('reportForm');
    form.addEventListener('submit', handleReportSubmission);
    
    // Handle photo upload
    const photoInput = document.getElementById('problemPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Handle address input changes
    const addressInput = document.getElementById('addressInput');
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            // Simple geocoding simulation - in real app you'd use geocoding service
            const address = this.value;
            if (address.length > 5) {
                // Set default coordinates for demo
                document.getElementById('latitude').value = 40.7128 + (Math.random() - 0.5) * 0.01;
                document.getElementById('longitude').value = -74.0060 + (Math.random() - 0.5) * 0.01;
            }
        });
    }
    
    // Handle location selection
    if (reportMap) {
        reportMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Update address input with coordinates
            const addressInput = document.getElementById('addressInput');
            if (addressInput) {
                addressInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
            
            // Clear previous markers
            reportMap.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    reportMap.removeLayer(layer);
                }
            });
            
            // Add new marker
            L.marker([lat, lng]).addTo(reportMap)
                .bindPopup('Selected location')
                .openPopup();
        });
    }
    
    // Get current location
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    reportMap.setView([lat, lng], 15);
                    
                    document.getElementById('latitude').value = lat;
                    document.getElementById('longitude').value = lng;
                    
                    // Update address input with current location
                    const addressInput = document.getElementById('addressInput');
                    if (addressInput) {
                        addressInput.value = `Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    }
                    
                    // Clear previous markers
                    reportMap.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            reportMap.removeLayer(layer);
                        }
                    });
                    
                    L.marker([lat, lng]).addTo(reportMap)
                        .bindPopup('Your current location')
                        .openPopup();
                });
            }
        });
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            preview.style.display = 'block';
            
            // Add remove photo functionality
            const removeBtn = document.getElementById('removePhoto');
            if (removeBtn) {
                removeBtn.onclick = function() {
                    preview.style.display = 'none';
                    event.target.value = '';
                    previewImage.src = '';
                };
            }
        };
        reader.readAsDataURL(file);
    }
}

function handleReportSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Create new issue
    const newIssue = {
        id: generateId(),
        type: document.getElementById('problemType').value,
        description: document.getElementById('problemDescription').value,
        location: {
            lat: parseFloat(document.getElementById('latitude').value) || 40.7128,
            lng: parseFloat(document.getElementById('longitude').value) || -74.0060,
            address: document.getElementById('addressInput').value || 'Location not specified'
        },
        status: 'reported',
        urgency: document.querySelector('input[name="urgency"]:checked').value,
        reporter: {
            name: document.getElementById('reporterName').value,
            email: document.getElementById('reporterEmail').value,
            phone: document.getElementById('reporterPhone').value
        },
        dateReported: new Date().toISOString().split('T')[0],
        upvotes: 0,
        department: null
    };
    
    // Add to issues array
    issues.push(newIssue);
    saveIssues();
    
    // Show success modal
    document.getElementById('trackingNumber').textContent = newIssue.id;
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Reset form
    form.reset();
    form.classList.remove('was-validated');
}

// ==========================================
// Feed Page Functions
// ==========================================

function initializeFeedPage() {
    if (!document.getElementById('issuesList')) return;
    
    loadIssues();
    displayIssues();
    updateStatistics();
    
    // Initialize map
    feedMap = initializeMap('feedMap');
    displayIssuesOnMap();
    
    // Add filter event listeners
    document.getElementById('searchInput').addEventListener('input', filterIssues);
    document.getElementById('categoryFilter').addEventListener('change', filterIssues);
    document.getElementById('statusFilter').addEventListener('change', filterIssues);
}

function displayIssues(filteredIssues = issues) {
    const container = document.getElementById('issuesList');
    if (!container) return;
    
    if (filteredIssues.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    document.getElementById('noResults').style.display = 'none';
    
    container.innerHTML = filteredIssues.map(issue => `
        <div class="problem-card" data-aos="fade-up">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center">
                    <div class="problem-type-icon type-${issue.type} me-3">
                        <i class="${getProblemIcon(issue.type)}"></i>
                    </div>
                    <div>
                        <h6 class="mb-1">${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue</h6>
                        <small class="text-muted">${issue.id} • ${formatDate(issue.dateReported)}</small>
                    </div>
                </div>
                <span class="status-badge status-${issue.status}">${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span>
            </div>
            
            <p class="mb-3">${issue.description}</p>
            
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        ${issue.location.address}
                    </small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="upvoteIssue('${issue.id}')">
                        <i class="fas fa-thumbs-up me-1"></i>
                        ${issue.upvotes}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewIssueDetails('${issue.id}')">
                        <i class="fas fa-eye me-1"></i>
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStatistics() {
    const total = issues.length;
    const reported = issues.filter(i => i.status === 'reported').length;
    const progress = issues.filter(i => i.status === 'progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    
    const elements = {
        'totalIssues': total,
        'reportedCount': reported,
        'progressCount': progress,
        'resolvedCount': resolved
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateCounter(element, value);
        }
    });
}

function filterIssues() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = issues.filter(issue => {
        const matchesSearch = issue.description.toLowerCase().includes(searchTerm) ||
                            issue.location.address.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || issue.type === categoryFilter;
        const matchesStatus = !statusFilter || issue.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    displayIssues(filtered);
}

function upvoteIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        issue.upvotes++;
        saveIssues();
        displayIssues();
    }
}

function viewIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const modalBody = document.getElementById('issueModalBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h5>${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue</h5>
                <p class="text-muted mb-3">${issue.id} • Reported on ${formatDate(issue.dateReported)}</p>
                <p><strong>Description:</strong> ${issue.description}</p>
                <p><strong>Location:</strong> ${issue.location.address}</p>
                <p><strong>Priority:</strong> <span class="badge bg-${issue.urgency === 'emergency' ? 'danger' : issue.urgency === 'high' ? 'warning' : 'info'}">${issue.urgency}</span></p>
                <p><strong>Status:</strong> <span class="status-badge status-${issue.status}">${issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</span></p>
                <p><strong>Community Support:</strong> ${issue.upvotes} upvotes</p>
            </div>
            <div class="col-md-4">
                <div class="map-container" style="height: 200px;">
                    <div id="issueDetailMap" style="height: 100%; width: 100%;"></div>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('issueModal'));
    modal.show();
    
    // Initialize map in modal
    setTimeout(() => {
        const detailMap = initializeMap('issueDetailMap', issue.location.lat, issue.location.lng);
        addMarkerToMap(detailMap, issue.location.lat, issue.location.lng, issue.description);
    }, 200);
}

function displayIssuesOnMap() {
    if (!feedMap) return;
    
    issues.forEach(issue => {
        const marker = addMarkerToMap(feedMap, issue.location.lat, issue.location.lng, 
            `<strong>${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}</strong><br>
             ${issue.description}<br>
             <span class="status-badge status-${issue.status}">${issue.status}</span>`
        );
        markers.push(marker);
    });
}

// ==========================================
// Dashboard Functions
// ==========================================

function initializeDashboard() {
    if (!document.getElementById('dashboardContent')) return;
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple demo authentication
    if (username === 'admin' && password === 'admin') {
        document.getElementById('loginGate').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        loadDashboardData();
    } else {
        alert('Invalid credentials. Use admin/admin for demo.');
    }
}

function loadDashboardData() {
    loadIssues();
    updateDashboardStats();
    loadIssuesTable();
    initializeCharts();
    
    // Add filter event listeners
    const statusFilter = document.getElementById('dashStatusFilter');
    const categoryFilter = document.getElementById('dashCategoryFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDashboardIssues);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterDashboardIssues);
    }
}

function filterDashboardIssues() {
    const statusFilter = document.getElementById('dashStatusFilter').value;
    const categoryFilter = document.getElementById('dashCategoryFilter').value;
    
    let filteredIssues = issues;
    
    if (statusFilter) {
        filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
    }
    
    if (categoryFilter) {
        filteredIssues = filteredIssues.filter(issue => issue.type === categoryFilter);
    }
    
    loadIssuesTable(filteredIssues);
}

function updateDashboardStats() {
    const total = issues.length;
    const pending = issues.filter(i => i.status === 'reported').length;
    const progress = issues.filter(i => i.status === 'progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    
    const elements = {
        'dashTotalIssues': total,
        'dashPendingIssues': pending,
        'dashInProgressIssues': progress,
        'dashResolvedIssues': resolved
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateCounter(element, value);
        }
    });
}

function loadIssuesTable(issuesToDisplay = issues) {
    const tbody = document.getElementById('issuesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = issuesToDisplay.map(issue => `
        <tr>
            <td>${issue.id}</td>
            <td><i class="${getProblemIcon(issue.type)} me-1"></i> ${issue.type}</td>
            <td class="text-truncate" style="max-width: 200px;" title="${issue.description}">${issue.description}</td>
            <td>${issue.location.address}</td>
            <td><span class="status-badge status-${issue.status}">${issue.status}</span></td>
            <td><span class="badge bg-${issue.urgency === 'emergency' ? 'danger' : issue.urgency === 'high' ? 'warning' : 'info'}">${issue.urgency}</span></td>
            <td>${formatDate(issue.dateReported)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="updateIssueStatus('${issue.id}')" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info ms-1" onclick="viewIssueDetails('${issue.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateIssueStatus(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    document.getElementById('updateIssueId').value = issueId;
    document.getElementById('updateStatus').value = issue.status;
    
    // Show/hide proof photo section based on status
    const statusSelect = document.getElementById('updateStatus');
    const proofSection = document.getElementById('proofPhotoSection');
    
    if (statusSelect && proofSection) {
        statusSelect.addEventListener('change', function() {
            if (this.value === 'resolved') {
                proofSection.style.display = 'block';
            } else {
                proofSection.style.display = 'none';
            }
        });
        
        // Initial check
        if (issue.status === 'resolved') {
            proofSection.style.display = 'block';
        }
    }
    
    // Add save button event listener
    const saveBtn = document.getElementById('saveUpdateBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            saveIssueUpdate(issueId);
        };
    }
    
    const modal = new bootstrap.Modal(document.getElementById('updateIssueModal'));
    modal.show();
}

function saveIssueUpdate(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    // Update issue properties
    issue.status = document.getElementById('updateStatus').value;
    issue.notes = document.getElementById('updateNotes').value;
    issue.estimatedCompletion = document.getElementById('estimatedCompletion').value;
    issue.department = document.getElementById('assignedDepartment').value;
    issue.lastUpdated = new Date().toISOString().split('T')[0];
    
    // Save to localStorage
    saveIssues();
    
    // Update dashboard display
    updateDashboardStats();
    loadIssuesTable();
    
    // Show success toast
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    toast.show();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('updateIssueModal'));
    if (modal) {
        modal.hide();
    }
    
    // Clear form
    document.getElementById('updateIssueForm').reset();
    document.getElementById('proofPhotoSection').style.display = 'none';
}

// ==========================================
// Contact Page Functions
// ==========================================

function initializeContactPage() {
    if (!document.getElementById('contactForm')) return;
    
    // Initialize contact map
    contactMap = initializeMap('contactMap', 40.7128, -74.0060);
    if (contactMap) {
        addMarkerToMap(contactMap, 40.7128, -74.0060, 
            '<strong>Municipal Office</strong><br>123 Main Street<br>City Hall, Suite 200');
    }
    
    // Handle contact form submission
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', handleContactSubmission);
}

function handleContactSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Show success modal
    const modal = new bootstrap.Modal(document.getElementById('contactSuccessModal'));
    modal.show();
    
    // Reset form
    form.reset();
    form.classList.remove('was-validated');
}

// ==========================================
// Information Page Functions
// ==========================================

function initializeInformationPage() {
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
}

// ==========================================
// Navigation Functions
// ==========================================

function initializeNavigation() {
    // Add scroll behavior to navbar
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// ==========================================
// Main Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
    
    // Initialize counters on home page
    if (document.querySelector('.stat-number[data-target]')) {
        setTimeout(initializeCounters, 500);
    }
    
    // Load issues data
    loadIssues();
    
    // Page-specific initializations
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'report.html':
            initializeReportPage();
            break;
        case 'feed.html':
            initializeFeedPage();
            break;
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
        case 'information.html':
            initializeInformationPage();
            break;
        default:
            // Home page or other pages
            break;
    }
});

// ==========================================
// Export functions for global access
// ==========================================

window.upvoteIssue = upvoteIssue;
window.viewIssueDetails = viewIssueDetails;
window.updateIssueStatus = updateIssueStatus;