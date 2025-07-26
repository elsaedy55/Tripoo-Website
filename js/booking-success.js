// Booking Success Page JavaScript

// Initialize booking success page
function initializeBookingSuccess() {
    loadBookingData();
    setupActions();
}

// Load booking data and display
function loadBookingData() {
    const booking = Tripo.loadFromLocalStorage('completedBooking');
    
    if (!booking) {
        // If no booking data, show error and redirect
        Tripo.showError('لم يتم العثور على بيانات الحجز');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }
    
    displayBookingDetails(booking);
}

// Display booking details
function displayBookingDetails(booking) {
    const { trip, searchParams, selectedSeats, passenger, payment } = booking;
    const company = Tripo.companies[trip.company];
    
    // Check if booking is confirmed by admin
    const allBookings = Tripo.loadFromLocalStorage('allBookings') || [];
    const confirmedBooking = allBookings.find(b => 
        b.bookingNumber === booking.bookingNumber && 
        b.status === 'confirmed' && 
        b.payment.status === 'confirmed'
    );
    
    // Show confirmation status
    if (!confirmedBooking) {
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message pending';
        statusMessage.innerHTML = `
            <div class="status-icon">
                <i class="fas fa-clock"></i>
            </div>
            <div class="status-text">
                <h4>حجزك قيد المراجعة</h4>
                <p>سيتم مراجعة حجزك وتأكيد الدفع من قبل الإدارة خلال 24 ساعة. لن تتمكن من طباعة التذكرة حتى التأكيد.</p>
            </div>
        `;
        
        const successCard = document.querySelector('.success-card');
        successCard.insertBefore(statusMessage, successCard.firstChild);
        
        // Disable download button
        const downloadBtn = document.querySelector('.btn.primary');
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-lock"></i> في انتظار التأكيد';
            downloadBtn.classList.add('disabled');
        }
    } else {
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message confirmed';
        statusMessage.innerHTML = `
            <div class="status-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="status-text">
                <h4>تم تأكيد حجزك!</h4>
                <p>تم تأكيد حجزك والدفع من قبل الإدارة. يمكنك الآن طباعة التذكرة.</p>
            </div>
        `;
        
        const successCard = document.querySelector('.success-card');
        successCard.insertBefore(statusMessage, successCard.firstChild);
    }
    
    // Update booking number
    document.getElementById('bookingNumber').textContent = booking.bookingNumber;
    
    // Update company info
    document.getElementById('companyName').textContent = company.name;
    document.getElementById('companyLogo').src = company.logo;
    document.getElementById('busType').textContent = trip.busType;
    
    // Update trip details
    document.getElementById('departureTime').textContent = trip.departureTime;
    document.getElementById('arrivalTime').textContent = trip.arrivalTime;
    document.getElementById('departureCity').textContent = Tripo.cities[trip.from];
    document.getElementById('arrivalCity').textContent = Tripo.cities[trip.to];
    document.getElementById('tripDuration').textContent = trip.duration;
    document.getElementById('tripDate').textContent = Tripo.formatDate(searchParams.date);
    
    // Update passenger info
    document.getElementById('seatNumbers').textContent = 
        selectedSeats.map(seat => seat.number).join(', ');
    document.getElementById('passengerName').textContent = passenger.name;
    document.getElementById('passengerPhone').textContent = passenger.phone;
    
    // Update payment summary
    document.getElementById('ticketsAmount').textContent = Tripo.formatPrice(payment.subtotal);
    document.getElementById('serviceAmount').textContent = Tripo.formatPrice(payment.serviceFee);
    document.getElementById('taxesAmount').textContent = Tripo.formatPrice(payment.taxAmount);
    document.getElementById('totalAmount').textContent = Tripo.formatPrice(payment.total);
    document.getElementById('paymentMethodUsed').textContent = getPaymentMethodName(payment.method);
    
    // Set company logo error handler
    document.getElementById('companyLogo').onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2N2VlYSIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pgo8L3N2Zz4=';
    };
}

// Setup action buttons
function setupActions() {
    // Add click handlers for action buttons
    const downloadBtn = document.querySelector('.btn.primary');
    const shareBtn = document.querySelector('.btn.secondary');
    const homeBtn = document.querySelector('.btn.outline');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTicket);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', shareBooking);
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', goToHome);
    }
}

// Copy booking number functionality
function copyBookingNumber() {
    const bookingNumber = document.getElementById('bookingNumber').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(bookingNumber).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopyText(bookingNumber);
        });
    } else {
        fallbackCopyText(bookingNumber);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        Tripo.showError('لم يتم نسخ رقم الحجز. يرجى تسجيله يدوياً');
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess() {
    const copyBtn = document.querySelector('.copy-btn');
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyBtn.style.background = '#28a745';
    
    Tripo.showSuccess('تم نسخ رقم الحجز');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = '#667eea';
    }, 2000);
}

// Download ticket functionality
function downloadTicket() {
    const booking = Tripo.loadFromLocalStorage('completedBooking');
    if (!booking) return;
    
    // Check if booking is confirmed by admin
    const allBookings = Tripo.loadFromLocalStorage('allBookings') || [];
    const confirmedBooking = allBookings.find(b => 
        b.bookingNumber === booking.bookingNumber && 
        b.status === 'confirmed' && 
        b.payment.status === 'confirmed'
    );
    
    if (!confirmedBooking) {
        Tripo.showError('لا يمكن طباعة التذكرة حتى يتم تأكيد الحجز والدفع من قبل الإدارة');
        return;
    }
    
    // In a real application, this would generate and download a PDF ticket
    // For now, we'll simulate the download process
    
    Tripo.showLoading();
    
    setTimeout(() => {
        Tripo.hideLoading();
        generateTicketPDF(booking);
    }, 2000);
}

function generateTicketPDF(booking) {
    // This is a simulation - in a real app you would use a PDF library like jsPDF
    const ticketData = generateTicketData(booking);
    
    // Create a blob with ticket data
    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `تذكرة-${booking.bookingNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    Tripo.showSuccess('تم تحميل التذكرة بنجاح');
}

function generateTicketData(booking) {
    const { trip, selectedSeats, passenger } = booking;
    const company = Tripo.companies[trip.company];
    
    return `
=====================================
           تذكرة سفر - Tripo
=====================================

رقم الحجز: ${booking.bookingNumber}
التاريخ: ${new Date().toLocaleDateString('ar-EG')}

-------------------------------------
           معلومات الرحلة
-------------------------------------
الشركة: ${company.name}
من: ${Tripo.cities[trip.from]}
إلى: ${Tripo.cities[trip.to]}
تاريخ السفر: ${Tripo.formatDate(booking.searchParams.date)}
وقت المغادرة: ${trip.departureTime}
وقت الوصول: ${trip.arrivalTime}
مدة الرحلة: ${trip.duration}
نوع الأتوبيس: ${trip.busType}

-------------------------------------
           معلومات المسافر
-------------------------------------
الاسم: ${passenger.name}
رقم الموبايل: ${passenger.phone}
رقم البطاقة: ${passenger.nationalId}

-------------------------------------
           معلومات المقاعد
-------------------------------------
المقاعد: ${selectedSeats.map(seat => seat.number).join(', ')}
عدد المقاعد: ${selectedSeats.length}

-------------------------------------
           معلومات الدفع
-------------------------------------
المبلغ المدفوع: ${Tripo.formatPrice(booking.payment.total)}
طريقة الدفع: ${getPaymentMethodName(booking.payment.method)}
حالة الدفع: مؤكد

=====================================
           ملاحظات مهمة
=====================================
• احضر هذه التذكرة وبطاقة الهوية عند السفر
• كن في المحطة قبل 30 دقيقة من الموعد
• لا يمكن استرداد التذكرة في يوم السفر
• للاستفسارات: 19199

=====================================
    شكراً لاختيارك Tripo للسفر
=====================================
    `;
}

// Share booking functionality
function shareBooking() {
    const booking = Tripo.loadFromLocalStorage('completedBooking');
    if (!booking) return;
    
    const shareData = {
        title: 'حجز رحلة مع Tripo',
        text: `تم حجز رحلتي من ${Tripo.cities[booking.trip.from]} إلى ${Tripo.cities[booking.trip.to]} بنجاح! رقم الحجز: ${booking.bookingNumber}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch((error) => {
            fallbackShare(shareData);
        });
    } else {
        fallbackShare(shareData);
    }
}

function fallbackShare(shareData) {
    // Create share options modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>مشاركة الحجز</h3>
                <button class="close-share" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-modal-body">
                <div class="share-options">
                    <button class="share-option" onclick="shareToWhatsApp('${shareData.text}')">
                        <i class="fab fa-whatsapp"></i>
                        واتساب
                    </button>
                    <button class="share-option" onclick="shareToFacebook('${shareData.url}')">
                        <i class="fab fa-facebook"></i>
                        فيسبوك
                    </button>
                    <button class="share-option" onclick="copyShareLink('${shareData.text}')">
                        <i class="fas fa-copy"></i>
                        نسخ النص
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function shareToWhatsApp(text) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareToFacebook(url) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

function copyShareLink(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            Tripo.showSuccess('تم نسخ النص');
        });
    } else {
        fallbackCopyText(text);
    }
}

// Get payment method display name
function getPaymentMethodName(method) {
    const names = {
        'vodafone-cash': 'فودافون كاش',
        'bank-transfer': 'تحويل بنكي',
        'cash-on-delivery': 'كاش عند الاستلام'
    };
    
    return names[method] || method;
}

// Go to home page
function goToHome() {
    // Clear temporary booking data
    localStorage.removeItem('searchParams');
    localStorage.removeItem('selectedTrip');
    localStorage.removeItem('bookingData');
    localStorage.removeItem('completedBooking');
    
    window.location.href = 'index.html';
}

// Auto-redirect after some time (optional)
function setupAutoRedirect() {
    // Uncomment if you want to auto-redirect after 5 minutes
    /*
    setTimeout(() => {
        if (confirm('هل تريد العودة للصفحة الرئيسية؟')) {
            goToHome();
        }
    }, 5 * 60 * 1000); // 5 minutes
    */
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeBookingSuccess();
    setupAutoRedirect();
});
