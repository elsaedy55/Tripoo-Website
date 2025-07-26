// Admin Panel JavaScript

let allBookings = [];
let filteredBookings = [];
let currentPage = 1;
let bookingsPerPage = 10;
let currentBookingForAction = null;

// Initialize admin panel
function initializeAdmin() {
    loadBookings();
    setupFilters();
    setupEventListeners();
    updateStats();
    displayBookings();
    displayPendingBookings();
}

// Load bookings from localStorage
function loadBookings() {
    allBookings = Tripo.loadFromLocalStorage('allBookings') || [];
    
    // Add some sample bookings if none exist
    if (allBookings.length === 0) {
        generateSampleBookings();
    }
    
    filteredBookings = [...allBookings];
}

// Generate sample bookings for demo
function generateSampleBookings() {
    const sampleData = [
        {
            bookingNumber: 'TR2025-001234',
            passenger: { name: 'أحمد محمد علي', phone: '01234567890', nationalId: '12345678901234' },
            trip: { from: 'cairo', to: 'alexandria', company: 'horus', departureTime: '08:00', departureDate: '2025-07-20' },
            selectedSeats: [{ number: 'A12', price: 85 }, { number: 'A13', price: 85 }],
            payment: { 
                method: 'vodafone-cash', 
                total: 200, 
                status: 'pending',
                transferReceipt: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
                transferDetails: {
                    transferNumber: '01234567890',
                    transferDate: '2025-07-19',
                    transferTime: '10:30'
                }
            },
            status: 'pending',
            bookedAt: '2025-07-19T10:30:00.000Z',
            canPrintTicket: false
        },
        {
            bookingNumber: 'TR2025-001235',
            passenger: { name: 'فاطمة أحمد محمد', phone: '01123456789', nationalId: '23456789012345' },
            trip: { from: 'cairo', to: 'aswan', company: 'saeed', departureTime: '20:00', departureDate: '2025-07-21' },
            selectedSeats: [{ number: 'B05', price: 150 }],
            payment: { 
                method: 'bank-transfer', 
                total: 165, 
                status: 'confirmed',
                transferDetails: {
                    bankName: 'البنك الأهلي المصري',
                    accountNumber: '123456789',
                    transferDate: '2025-07-19'
                }
            },
            status: 'confirmed',
            bookedAt: '2025-07-19T09:15:00.000Z',
            canPrintTicket: true
        },
        {
            bookingNumber: 'TR2025-001236',
            passenger: { name: 'محمد سعد إبراهيم', phone: '01012345678', nationalId: '34567890123456' },
            trip: { from: 'sohag', to: 'cairo', company: 'cairo-express', departureTime: '14:00', departureDate: '2025-07-22' },
            selectedSeats: [{ number: 'C08', price: 120 }],
            payment: { 
                method: 'cash-on-delivery', 
                total: 135, 
                status: 'pending'
            },
            status: 'pending',
            bookedAt: '2025-07-19T08:45:00.000Z',
            canPrintTicket: false
        }
    ];
    
    // Generate more sample bookings
    for (let i = 0; i < 20; i++) {
        const companies = Object.keys(Tripo.companies);
        const cities = Object.keys(Tripo.cities);
        const paymentMethods = ['vodafone-cash', 'bank-transfer', 'cash-on-delivery'];
        const statuses = ['confirmed', 'cancelled', 'completed'];
        
        const booking = {
            bookingNumber: Tripo.generateBookingNumber(),
            passenger: {
                name: generateRandomName(),
                phone: generateRandomPhone(),
                nationalId: generateRandomNationalId()
            },
            trip: {
                from: cities[Math.floor(Math.random() * cities.length)],
                to: cities[Math.floor(Math.random() * cities.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                departureTime: generateRandomTime(),
                departureDate: generateRandomFutureDate()
            },
            selectedSeats: [{
                number: generateRandomSeat(),
                price: Math.floor(Math.random() * 100) + 70
            }],
            payment: {
                method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                total: Math.floor(Math.random() * 200) + 80,
                status: Math.random() > 0.7 ? 'pending' : 'confirmed'
            },
            status: Math.random() > 0.8 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)],
            bookedAt: generateRandomDate(),
            canPrintTicket: false
        };
        
        // Set canPrintTicket based on status
        booking.canPrintTicket = (booking.status === 'confirmed' && booking.payment.status === 'confirmed');
        
        sampleData.push(booking);
    }
    
    allBookings = sampleData;
    Tripo.saveToLocalStorage('allBookings', allBookings);
}

// Helper functions for generating sample data
function generateRandomName() {
    const firstNames = ['أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب'];
    const lastNames = ['محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'عبدالله', 'عبدالرحمن', 'الصادق', 'المنصور'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const familyName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName} ${familyName}`;
}

function generateRandomPhone() {
    const prefixes = ['010', '011', '012', '015'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + number;
}

function generateRandomNationalId() {
    return Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
}

function generateRandomSeat() {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * 10)); // A-J
    const number = Math.floor(Math.random() * 4) + 1; // 1-4
    return row + number;
}

function generateRandomTime() {
    const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minute = (Math.floor(Math.random() * 4) * 15).toString().padStart(2, '0');
    return `${hour}:${minute}`;
}

function generateRandomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return date.toISOString();
}

function generateRandomFutureDate() {
    const now = new Date();
    const daysAhead = Math.floor(Math.random() * 30) + 1; // Next 30 days
    const date = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Update dashboard statistics
function updateStats() {
    const totalBookings = allBookings.length;
    const totalRevenue = allBookings
        .filter(booking => booking.payment.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.payment.total, 0);
    const uniqueCustomers = new Set(allBookings.map(booking => booking.passenger.phone)).size;
    const todayBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.bookedAt);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
    }).length;
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalRevenue').textContent = Tripo.formatPrice(totalRevenue);
    document.getElementById('totalCustomers').textContent = uniqueCustomers;
    document.getElementById('todayBookings').textContent = todayBookings;
}

// Display pending bookings that need confirmation
function displayPendingBookings() {
    const pendingBookings = allBookings.filter(booking => 
        booking.status === 'pending' || booking.payment.status === 'pending'
    );
    
    const pendingContainer = document.getElementById('pendingBookings');
    const pendingCount = document.getElementById('pendingCount');
    
    pendingCount.textContent = pendingBookings.length;
    
    if (pendingBookings.length === 0) {
        pendingContainer.innerHTML = `
            <div class="no-pending">
                <i class="fas fa-check-circle"></i>
                <p>لا توجد حجوزات معلقة</p>
            </div>
        `;
        return;
    }
    
    pendingContainer.innerHTML = pendingBookings.map(booking => `
        <div class="pending-card">
            <div class="pending-header">
                <div class="booking-info">
                    <h4>${booking.bookingNumber}</h4>
                    <p>${booking.passenger.name}</p>
                </div>
                <div class="pending-actions">
                    <button class="action-btn confirm" onclick="quickConfirm('${booking.bookingNumber}')">
                        <i class="fas fa-check"></i>
                        تأكيد
                    </button>
                    <button class="action-btn reject" onclick="quickReject('${booking.bookingNumber}')">
                        <i class="fas fa-times"></i>
                        رفض
                    </button>
                    <button class="action-btn details" onclick="viewPaymentDetails('${booking.bookingNumber}')">
                        <i class="fas fa-eye"></i>
                        التفاصيل
                    </button>
                </div>
            </div>
            <div class="pending-details">
                <div class="detail-item">
                    <span class="label">الرحلة:</span>
                    <span class="value">${Tripo.cities[booking.trip.from]} → ${Tripo.cities[booking.trip.to]}</span>
                </div>
                <div class="detail-item">
                    <span class="label">المبلغ:</span>
                    <span class="value">${Tripo.formatPrice(booking.payment.total)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">طريقة الدفع:</span>
                    <span class="value">${getPaymentMethodName(booking.payment.method)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">حالة الدفع:</span>
                    <span class="value status-${booking.payment.status}">${getPaymentStatusName(booking.payment.status)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup filters and search
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const paymentStatusFilter = document.getElementById('paymentStatusFilter');
    const companyFilter = document.getElementById('companyFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    searchInput.addEventListener('input', debounce(filterBookings, 300));
    statusFilter.addEventListener('change', filterBookings);
    paymentStatusFilter.addEventListener('change', filterBookings);
    companyFilter.addEventListener('change', filterBookings);
    dateFilter.addEventListener('change', filterBookings);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter bookings based on search and filters
function filterBookings() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const paymentStatusFilter = document.getElementById('paymentStatusFilter').value;
    const companyFilter = document.getElementById('companyFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredBookings = allBookings.filter(booking => {
        // Search filter
        const matchesSearch = !searchTerm || 
            booking.bookingNumber.toLowerCase().includes(searchTerm) ||
            booking.passenger.name.toLowerCase().includes(searchTerm) ||
            booking.passenger.phone.includes(searchTerm);
        
        // Status filter
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        
        // Payment status filter
        const matchesPaymentStatus = !paymentStatusFilter || booking.payment.status === paymentStatusFilter;
        
        // Company filter
        const matchesCompany = !companyFilter || booking.trip.company === companyFilter;
        
        // Date filter
        const matchesDate = !dateFilter || 
            new Date(booking.bookedAt).toDateString() === new Date(dateFilter).toDateString();
        
        return matchesSearch && matchesStatus && matchesPaymentStatus && matchesCompany && matchesDate;
    });
    
    currentPage = 1;
    displayBookings();
    updatePagination();
}

// Search bookings (public function)
function searchBookings() {
    filterBookings();
}

// Display bookings in table
function displayBookings() {
    const tableBody = document.getElementById('bookingsTableBody');
    const startIndex = (currentPage - 1) * bookingsPerPage;
    const endIndex = startIndex + bookingsPerPage;
    const bookingsToShow = filteredBookings.slice(startIndex, endIndex);
    
    if (bookingsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center; padding: 2rem; color: #666;">
                    لا توجد حجوزات مطابقة للبحث
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = bookingsToShow.map(booking => `
        <tr class="${booking.status === 'pending' ? 'pending-row' : ''}">
            <td>${booking.bookingNumber}</td>
            <td>${booking.passenger.name}</td>
            <td>${booking.passenger.phone}</td>
            <td>${Tripo.cities[booking.trip.from]} → ${Tripo.cities[booking.trip.to]}</td>
            <td>${formatBookingDate(booking.bookedAt)}</td>
            <td>${Tripo.companies[booking.trip.company].name}</td>
            <td>${booking.selectedSeats.map(seat => seat.number).join(', ')}</td>
            <td>${Tripo.formatPrice(booking.payment.total)}</td>
            <td>${getPaymentMethodName(booking.payment.method)}</td>
            <td>
                <span class="status-badge payment-status-${booking.payment.status}">
                    ${getPaymentStatusName(booking.payment.status)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${booking.status}">
                    ${getStatusName(booking.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewBooking('${booking.bookingNumber}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editBooking('${booking.bookingNumber}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${booking.payment.method !== 'cash-on-delivery' ? `
                        <button class="action-btn payment" onclick="viewPaymentDetails('${booking.bookingNumber}')" title="تفاصيل الدفع">
                            <i class="fas fa-credit-card"></i>
                        </button>
                    ` : ''}
                    ${booking.canPrintTicket ? `
                        <button class="action-btn print" onclick="printTicket('${booking.bookingNumber}')" title="طباعة التذكرة">
                            <i class="fas fa-print"></i>
                        </button>
                    ` : `
                        <button class="action-btn print disabled" title="يجب تأكيد الحجز والدفع أولاً" disabled>
                            <i class="fas fa-print"></i>
                        </button>
                    `}
                    <button class="action-btn delete" onclick="deleteBooking('${booking.bookingNumber}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Export buttons
    document.querySelector('.export-btn[onclick="exportToExcel()"]').addEventListener('click', exportToExcel);
    document.querySelector('.export-btn[onclick="exportToPDF()"]').addEventListener('click', exportToPDF);
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayBookings();
    updatePagination();
}

// View booking details
function viewBooking(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('bookingModalBody');
    
    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="detail-section">
                <h4>معلومات المسافر</h4>
                <p><strong>الاسم:</strong> ${booking.passenger.name}</p>
                <p><strong>رقم الموبايل:</strong> ${booking.passenger.phone}</p>
                <p><strong>رقم البطاقة:</strong> ${booking.passenger.nationalId}</p>
            </div>
            
            <div class="detail-section">
                <h4>معلومات الرحلة</h4>
                <p><strong>من:</strong> ${Tripo.cities[booking.trip.from]}</p>
                <p><strong>إلى:</strong> ${Tripo.cities[booking.trip.to]}</p>
                <p><strong>الشركة:</strong> ${Tripo.companies[booking.trip.company].name}</p>
                <p><strong>تاريخ المغادرة:</strong> ${booking.trip.departureDate || 'غير محدد'}</p>
                <p><strong>وقت المغادرة:</strong> ${booking.trip.departureTime}</p>
                <p><strong>المقاعد:</strong> ${booking.selectedSeats.map(seat => seat.number).join(', ')}</p>
            </div>
            
            <div class="detail-section">
                <h4>معلومات الدفع</h4>
                <p><strong>طريقة الدفع:</strong> ${getPaymentMethodName(booking.payment.method)}</p>
                <p><strong>المبلغ:</strong> ${Tripo.formatPrice(booking.payment.total)}</p>
                <p><strong>حالة الدفع:</strong> 
                    <span class="status-badge payment-status-${booking.payment.status}">
                        ${getPaymentStatusName(booking.payment.status)}
                    </span>
                </p>
            </div>
            
            <div class="detail-section">
                <h4>معلومات إضافية</h4>
                <p><strong>حالة الحجز:</strong> 
                    <span class="status-badge status-${booking.status}">
                        ${getStatusName(booking.status)}
                    </span>
                </p>
                <p><strong>تاريخ الحجز:</strong> ${formatFullDate(booking.bookedAt)}</p>
                <p><strong>يمكن طباعة التذكرة:</strong> ${booking.canPrintTicket ? 'نعم' : 'لا'}</p>
                ${booking.notes ? `<p><strong>ملاحظات:</strong> ${booking.notes}</p>` : ''}
            </div>
        </div>
    `;
    
    // Store current booking for printing
    currentBookingForAction = booking;
    
    modal.style.display = 'block';
}

// Quick confirm booking from pending list
function quickConfirm(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    if (confirm(`هل تريد تأكيد الحجز ${bookingNumber}؟`)) {
        booking.status = 'confirmed';
        booking.payment.status = 'confirmed';
        booking.canPrintTicket = true;
        booking.confirmedAt = new Date().toISOString();
        
        saveBookingsAndRefresh();
        Tripo.showSuccess('تم تأكيد الحجز بنجاح');
    }
}

// Quick reject booking from pending list
function quickReject(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    const reason = prompt('سبب الرفض (اختياري):');
    
    booking.status = 'cancelled';
    booking.payment.status = 'failed';
    booking.canPrintTicket = false;
    booking.rejectedAt = new Date().toISOString();
    booking.rejectionReason = reason || 'تم الرفض من قبل الإدارة';
    
    saveBookingsAndRefresh();
    Tripo.showSuccess('تم رفض الحجز');
}

// View payment details with documents
function viewPaymentDetails(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    const modal = document.getElementById('paymentModal');
    const modalBody = document.getElementById('paymentModalBody');
    
    let transferDetailsHTML = '';
    
    if (booking.payment.method === 'vodafone-cash' && booking.payment.transferDetails) {
        transferDetailsHTML = `
            <div class="transfer-details">
                <h4>تفاصيل التحويل - فودافون كاش</h4>
                <p><strong>رقم المحفظة:</strong> ${booking.payment.transferDetails.transferNumber}</p>
                <p><strong>تاريخ التحويل:</strong> ${booking.payment.transferDetails.transferDate}</p>
                <p><strong>وقت التحويل:</strong> ${booking.payment.transferDetails.transferTime}</p>
            </div>
        `;
    } else if (booking.payment.method === 'bank-transfer' && booking.payment.transferDetails) {
        transferDetailsHTML = `
            <div class="transfer-details">
                <h4>تفاصيل التحويل البنكي</h4>
                <p><strong>اسم البنك:</strong> ${booking.payment.transferDetails.bankName}</p>
                <p><strong>رقم الحساب:</strong> ${booking.payment.transferDetails.accountNumber}</p>
                <p><strong>تاريخ التحويل:</strong> ${booking.payment.transferDetails.transferDate}</p>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="payment-details">
            <div class="detail-section">
                <h4>معلومات الدفع</h4>
                <p><strong>رقم الحجز:</strong> ${booking.bookingNumber}</p>
                <p><strong>اسم العميل:</strong> ${booking.passenger.name}</p>
                <p><strong>طريقة الدفع:</strong> ${getPaymentMethodName(booking.payment.method)}</p>
                <p><strong>المبلغ المطلوب:</strong> ${Tripo.formatPrice(booking.payment.total)}</p>
                <p><strong>حالة الدفع:</strong> 
                    <span class="status-badge payment-status-${booking.payment.status}">
                        ${getPaymentStatusName(booking.payment.status)}
                    </span>
                </p>
            </div>
            
            ${transferDetailsHTML}
            
            ${booking.payment.transferReceipt ? `
                <div class="detail-section">
                    <h4>إيصال التحويل</h4>
                    <div class="receipt-preview">
                        <img src="${booking.payment.transferReceipt}" alt="إيصال التحويل" class="receipt-image">
                    </div>
                </div>
            ` : ''}
            
            ${booking.payment.method === 'cash-on-delivery' ? `
                <div class="detail-section">
                    <h4>الدفع كاش عند الاستلام</h4>
                    <p>سيتم تحصيل المبلغ عند استلام التذكرة</p>
                    <p><strong>ملاحظة:</strong> يجب التأكد من هوية العميل عند الاستلام</p>
                </div>
            ` : ''}
        </div>
    `;
    
    // Store current booking for payment actions
    currentBookingForAction = booking;
    
    modal.style.display = 'block';
}

// Confirm payment
function confirmPayment() {
    if (!currentBookingForAction) return;
    
    if (confirm(`هل تريد تأكيد دفع الحجز ${currentBookingForAction.bookingNumber}؟`)) {
        currentBookingForAction.payment.status = 'confirmed';
        currentBookingForAction.status = 'confirmed';
        currentBookingForAction.canPrintTicket = true;
        currentBookingForAction.paymentConfirmedAt = new Date().toISOString();
        
        saveBookingsAndRefresh();
        closePaymentModal();
        Tripo.showSuccess('تم تأكيد الدفع بنجاح');
    }
}

// Reject payment
function rejectPayment() {
    if (!currentBookingForAction) return;
    
    const reason = prompt('سبب رفض الدفع:');
    if (reason) {
        currentBookingForAction.payment.status = 'failed';
        currentBookingForAction.status = 'cancelled';
        currentBookingForAction.canPrintTicket = false;
        currentBookingForAction.paymentRejectedAt = new Date().toISOString();
        currentBookingForAction.paymentRejectionReason = reason;
        
        saveBookingsAndRefresh();
        closePaymentModal();
        Tripo.showSuccess('تم رفض الدفع');
    }
}

// Print ticket (only if confirmed)
function printTicket(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    if (!booking.canPrintTicket) {
        Tripo.showError('لا يمكن طباعة التذكرة. يجب تأكيد الحجز والدفع أولاً');
        return;
    }
    
    const modal = document.getElementById('ticketModal');
    const modalBody = document.getElementById('ticketModalBody');
    
    modalBody.innerHTML = generateTicketHTML(booking);
    modal.style.display = 'block';
    
    // Store current booking
    currentBookingForAction = booking;
}

// Generate ticket HTML
function generateTicketHTML(booking) {
    return `
        <div class="ticket" id="ticketToPrint">
            <div class="ticket-header">
                <div class="logo-section">
                    <img src="images/logo.png" alt="Tripo" class="ticket-logo">
                    <h2>Tripo</h2>
                </div>
                <div class="ticket-number">
                    <h3>تذكرة سفر</h3>
                    <p>${booking.bookingNumber}</p>
                </div>
            </div>
            
            <div class="ticket-body">
                <div class="passenger-info">
                    <h4>معلومات المسافر</h4>
                    <p><strong>الاسم:</strong> ${booking.passenger.name}</p>
                    <p><strong>رقم الموبايل:</strong> ${booking.passenger.phone}</p>
                    <p><strong>رقم البطاقة:</strong> ${booking.passenger.nationalId}</p>
                </div>
                
                <div class="trip-info">
                    <h4>تفاصيل الرحلة</h4>
                    <div class="route">
                        <div class="from">
                            <h5>من</h5>
                            <p>${Tripo.cities[booking.trip.from]}</p>
                        </div>
                        <div class="arrow">→</div>
                        <div class="to">
                            <h5>إلى</h5>
                            <p>${Tripo.cities[booking.trip.to]}</p>
                        </div>
                    </div>
                    <p><strong>شركة النقل:</strong> ${Tripo.companies[booking.trip.company].name}</p>
                    <p><strong>تاريخ المغادرة:</strong> ${booking.trip.departureDate}</p>
                    <p><strong>وقت المغادرة:</strong> ${booking.trip.departureTime}</p>
                </div>
                
                <div class="seat-info">
                    <h4>معلومات المقعد</h4>
                    <div class="seats">
                        ${booking.selectedSeats.map(seat => `
                            <div class="seat-item">
                                <span class="seat-number">${seat.number}</span>
                                <span class="seat-price">${Tripo.formatPrice(seat.price)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <p class="total"><strong>المجموع:</strong> ${Tripo.formatPrice(booking.payment.total)}</p>
                </div>
            </div>
            
            <div class="ticket-footer">
                <div class="qr-section">
                    <div class="qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>QR Code</p>
                    </div>
                </div>
                <div class="terms">
                    <p>• يرجى الوصول قبل موعد المغادرة بـ 30 دقيقة</p>
                    <p>• يجب إحضار بطاقة الهوية الشخصية</p>
                    <p>• غير قابلة للاسترداد أو التغيير</p>
                </div>
            </div>
            
            <div class="print-date">
                طُبعت في: ${new Date().toLocaleString('ar-EG')}
            </div>
        </div>
    `;
}

// Save bookings and refresh displays
function saveBookingsAndRefresh() {
    Tripo.saveToLocalStorage('allBookings', allBookings);
    filterBookings();
    updateStats();
    displayPendingBookings();
}

// Edit booking
function editBooking(bookingNumber) {
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (!booking) return;
    
    const modal = document.getElementById('editBookingModal');
    const statusSelect = document.getElementById('editStatus');
    const paymentStatusSelect = document.getElementById('editPaymentStatus');
    const notesTextarea = document.getElementById('editNotes');
    
    statusSelect.value = booking.status;
    paymentStatusSelect.value = booking.payment.status;
    notesTextarea.value = booking.notes || '';
    
    // Store current booking number for saving
    modal.dataset.bookingNumber = bookingNumber;
    
    modal.style.display = 'block';
}

// Delete booking
function deleteBooking(bookingNumber) {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
    
    allBookings = allBookings.filter(b => b.bookingNumber !== bookingNumber);
    Tripo.saveToLocalStorage('allBookings', allBookings);
    
    filterBookings();
    updateStats();
    
    Tripo.showSuccess('تم حذف الحجز بنجاح');
}

// Export functions
function exportToExcel() {
    const csvContent = generateCSV();
    downloadFile(csvContent, 'bookings.csv', 'text/csv');
}

function exportToPDF() {
    // In a real application, you would use a PDF library like jsPDF
    const textContent = generateTextReport();
    downloadFile(textContent, 'bookings-report.txt', 'text/plain');
}

function generateCSV() {
    const headers = [
        'رقم الحجز', 'اسم المسافر', 'رقم الموبايل', 'الرحلة', 'التاريخ', 
        'الشركة', 'المقاعد', 'المبلغ', 'طريقة الدفع', 'الحالة'
    ];
    
    const rows = filteredBookings.map(booking => [
        booking.bookingNumber,
        booking.passenger.name,
        booking.passenger.phone,
        `${Tripo.cities[booking.trip.from]} → ${Tripo.cities[booking.trip.to]}`,
        formatBookingDate(booking.bookedAt),
        Tripo.companies[booking.trip.company].name,
        booking.selectedSeats.map(seat => seat.number).join('; '),
        booking.payment.total,
        getPaymentMethodName(booking.payment.method),
        getStatusName(booking.status)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateTextReport() {
    let report = 'تقرير الحجوزات - Tripo\n';
    report += '=' * 50 + '\n\n';
    
    filteredBookings.forEach(booking => {
        report += `رقم الحجز: ${booking.bookingNumber}\n`;
        report += `المسافر: ${booking.passenger.name}\n`;
        report += `الرحلة: ${Tripo.cities[booking.trip.from]} → ${Tripo.cities[booking.trip.to]}\n`;
        report += `المبلغ: ${Tripo.formatPrice(booking.payment.total)}\n`;
        report += `الحالة: ${getStatusName(booking.status)}\n`;
        report += '-' * 30 + '\n';
    });
    
    return report;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Modal functions
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    currentBookingForAction = null;
}

function closeEditModal() {
    document.getElementById('editBookingModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    currentBookingForAction = null;
}

function closeTicketModal() {
    document.getElementById('ticketModal').style.display = 'none';
    currentBookingForAction = null;
}

// Save booking edits
document.getElementById('editBookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const modal = document.getElementById('editBookingModal');
    const bookingNumber = modal.dataset.bookingNumber;
    const newStatus = document.getElementById('editStatus').value;
    const newPaymentStatus = document.getElementById('editPaymentStatus').value;
    const notes = document.getElementById('editNotes').value;
    
    const booking = allBookings.find(b => b.bookingNumber === bookingNumber);
    if (booking) {
        const oldStatus = booking.status;
        const oldPaymentStatus = booking.payment.status;
        
        booking.status = newStatus;
        booking.payment.status = newPaymentStatus;
        booking.notes = notes;
        booking.updatedAt = new Date().toISOString();
        
        // Update canPrintTicket based on new statuses
        booking.canPrintTicket = (newStatus === 'confirmed' && newPaymentStatus === 'confirmed');
        
        // Log status changes
        if (oldStatus !== newStatus || oldPaymentStatus !== newPaymentStatus) {
            booking.statusHistory = booking.statusHistory || [];
            booking.statusHistory.push({
                timestamp: new Date().toISOString(),
                oldStatus: oldStatus,
                newStatus: newStatus,
                oldPaymentStatus: oldPaymentStatus,
                newPaymentStatus: newPaymentStatus,
                notes: notes
            });
        }
        
        saveBookingsAndRefresh();
        closeEditModal();
        
        Tripo.showSuccess('تم تحديث الحجز بنجاح');
    }
});

// Utility functions
function formatBookingDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG');
}

function formatFullDate(dateString) {
    return new Date(dateString).toLocaleString('ar-EG');
}

function getPaymentMethodName(method) {
    const names = {
        'vodafone-cash': 'فودافون كاش',
        'instapay': 'انستاباي',
        'bank-transfer': 'تحويل بنكي',
        'cash-on-delivery': 'كاش عند الاستلام'
    };
    return names[method] || method;
}

function getPaymentStatusName(status) {
    const names = {
        'pending': 'معلق',
        'confirmed': 'مؤكد',
        'failed': 'فاشل'
    };
    return names[status] || status;
}

function getStatusName(status) {
    const names = {
        'pending': 'معلق',
        'confirmed': 'مؤكد',
        'cancelled': 'ملغي',
        'completed': 'مكتمل'
    };
    return names[status] || status;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const editModal = document.getElementById('editBookingModal');
    const paymentModal = document.getElementById('paymentModal');
    const ticketModal = document.getElementById('ticketModal');
    
    if (event.target === bookingModal) {
        closeBookingModal();
    }
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === paymentModal) {
        closePaymentModal();
    }
    if (event.target === ticketModal) {
        closeTicketModal();
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdmin);
