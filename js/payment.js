// Payment Page JavaScript - Redesigned

let paymentData = {};

// Notification function (if not available from main.js)
function showNotification(message, type = 'info', duration = 3000) {
    if (typeof Tripo !== 'undefined' && typeof Tripo.showNotification === 'function') {
        Tripo.showNotification(message, type, duration);
    } else if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
    } else {
        // Create custom notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'error') {
            notification.style.background = '#e74c3c';
        } else if (type === 'success') {
            notification.style.background = '#27ae60';
        } else {
            notification.style.background = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ النص بنجاح', 'success', 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم نسخ النص بنجاح', 'success', 2000);
    });
}

// Initialize payment page
function initializePayment() {
    loadBookingData();
    setupPaymentMethods();
    setupForm();
    setupFileUploads();
}

// Load booking data from localStorage
function loadBookingData() {
    const bookingData = Tripo.loadFromLocalStorage('bookingData');
    
    if (!bookingData) {
        // If no booking data, create test data for debugging
        console.log('No booking data found, creating test data...');
        const testBookingData = {
            trip: {
                id: 1,
                company: 'horus',
                from: 'cairo',
                to: 'alexandria',
                departureTime: '08:00',
                arrivalTime: '11:30',
                duration: '3 ساعات 30 دقيقة',
                price: 85,
                busType: 'VIP',
                departureDate: '2025-07-20'
            },
            searchParams: {
                from: 'cairo',
                to: 'alexandria',
                date: '2025-07-20',
                passengers: '2'
            },
            selectedSeats: [
                { number: 'A12', price: 85 },
                { number: 'A13', price: 85 }
            ],
            subtotal: 170,
            serviceFee: 15,
            total: 185
        };
        Tripo.saveToLocalStorage('bookingData', testBookingData);
        paymentData = testBookingData;
        showNotification('تم إنشاء بيانات حجز تجريبية للاختبار', 'info', 3000);
    } else {
        paymentData = bookingData;
    }
    
    updatePaymentSummary();
}

// Update payment summary sidebar
function updatePaymentSummary() {
    const { trip, searchParams, selectedSeats, subtotal, serviceFee, total } = paymentData;
    const company = Tripo.companies[trip.company];
    
    // Update company info
    document.getElementById('companyName').textContent = company.name;
    document.getElementById('departureCity').textContent = Tripo.cities[trip.from];
    document.getElementById('arrivalCity').textContent = Tripo.cities[trip.to];
    document.getElementById('tripDate').textContent = Tripo.formatDate(searchParams.date);
    document.getElementById('departureTime').textContent = trip.departureTime;
    document.getElementById('arrivalTime').textContent = trip.arrivalTime;
    
    // Set company logo
    const companyLogo = document.getElementById('companyLogo');
    companyLogo.src = company.logo;
    companyLogo.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2N2VlYSIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pgo8L3N2Zz4=';
    };
    
    // Update selected seats
    const selectedSeatsList = document.getElementById('selectedSeatsList');
    selectedSeatsList.innerHTML = selectedSeats.map(seat => `
        <div class="selected-seat-item">
            <span>مقعد ${seat.number}</span>
            <span>${Tripo.formatPrice(seat.price)}</span>
        </div>
    `).join('');
    
    // Update price summary
    const taxAmount = Math.ceil(total * 0.14); // 14% tax
    const finalTotal = total + taxAmount;
    
    document.getElementById('ticketsPrice').textContent = Tripo.formatPrice(subtotal);
    document.getElementById('serviceFee').textContent = Tripo.formatPrice(serviceFee);
    document.getElementById('taxAmount').textContent = Tripo.formatPrice(taxAmount);
    document.getElementById('finalTotal').textContent = Tripo.formatPrice(finalTotal);
    
    // Update amount displays in payment methods
    const amountDisplays = ['vodafoneAmount', 'cashAmount'];
    amountDisplays.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = Tripo.formatPrice(finalTotal);
        }
    });
}

// Setup payment methods
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            updatePaymentDetails(e.target.value);
        });
    });
    
    // Initialize with default payment method
    updatePaymentDetails('vodafone-cash');
}

// Update payment details based on selected method
function updatePaymentDetails(method) {
    console.log('Updating payment details for method:', method); // Debug
    
    // Hide all payment details sections
    const allSections = document.querySelectorAll('.payment-details-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected payment method details
    const selectedSection = document.getElementById(`${method}-details`);
    if (selectedSection) {
        selectedSection.classList.add('active');
        console.log('Activated section:', `${method}-details`); // Debug
    } else {
        console.error('Section not found:', `${method}-details`); // Debug
    }
    
    // Update required attributes based on payment method
    updateRequiredFields(method);
}

// Update required fields based on payment method
function updateRequiredFields(method) {
    console.log('Updating required fields for:', method); // Debug
    
    // Clear all payment method specific required attributes first
    const paymentFields = [
        'vodafoneSender', 'vodafoneScreenshot',
        'instapayEmail', 'instapayScreenshot',
        'bankScreenshot'
    ];
    
    paymentFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.removeAttribute('required');
        }
    });
    
    // Set required fields based on selected method
    switch (method) {
        case 'vodafone-cash':
            const senderField = document.getElementById('vodafoneSender');
            const screenshotField = document.getElementById('vodafoneScreenshot');
            if (senderField) senderField.setAttribute('required', 'required');
            if (screenshotField) screenshotField.setAttribute('required', 'required');
            break;
            
        case 'instapay':
            const emailField = document.getElementById('instapayEmail');
            const instapayScreenshot = document.getElementById('instapayScreenshot');
            if (emailField) emailField.setAttribute('required', 'required');
            if (instapayScreenshot) instapayScreenshot.setAttribute('required', 'required');
            break;
            
        case 'bank-transfer':
            const bankScreenshot = document.getElementById('bankScreenshot');
            if (bankScreenshot) bankScreenshot.setAttribute('required', 'required');
            break;
            
        case 'cash-on-delivery':
            // No additional required fields
            break;
    }
}

// Setup file upload functionality
function setupFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            handleFileUpload(e.target);
        });
    });
}

// Handle file upload
function handleFileUpload(input) {
    const uploadZone = input.closest('.file-upload-zone');
    const uploadContent = uploadZone.querySelector('.upload-content');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        uploadZone.classList.add('has-file');
        uploadContent.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>تم اختيار الملف: ${file.name}</span>
        `;
    } else {
        uploadZone.classList.remove('has-file');
        uploadContent.innerHTML = `
            <i class="fas fa-camera"></i>
            <span>اختر صورة شاشة التحويل</span>
        `;
    }
}

// Setup form
function setupForm() {
    const form = document.getElementById('paymentForm');
    
    if (!form) {
        console.error('Payment form not found!');
        return;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug
        processPayment();
    });
    
    // Real-time validation
    setupFieldValidation();
    
    console.log('Form setup completed'); // Debug
}

// Setup field validation
function setupFieldValidation() {
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const nationalIdField = document.getElementById('nationalId');
    
    if (phoneField) {
        phoneField.addEventListener('blur', (e) => {
            if (e.target.value && !Tripo.validatePhoneNumber(e.target.value)) {
                showFieldError(e.target, 'رقم الموبايل غير صحيح');
            } else {
                clearFieldError(e.target);
            }
        });
    }
    
    if (emailField) {
        emailField.addEventListener('blur', (e) => {
            if (e.target.value && !Tripo.validateEmail(e.target.value)) {
                showFieldError(e.target, 'البريد الإلكتروني غير صحيح');
            } else {
                clearFieldError(e.target);
            }
        });
    }
    
    if (nationalIdField) {
        nationalIdField.addEventListener('blur', (e) => {
            if (e.target.value && !Tripo.validateNationalId(e.target.value)) {
                showFieldError(e.target, 'رقم البطاقة الشخصية غير صحيح');
            } else {
                clearFieldError(e.target);
            }
        });
    }
    
    // Setup dynamic validation for payment method fields
    document.addEventListener('blur', (e) => {
        if (e.target.name === 'senderNumber') {
            if (e.target.value && !Tripo.validatePhoneNumber(e.target.value)) {
                showFieldError(e.target, 'رقم المحول منه غير صحيح');
            } else {
                clearFieldError(e.target);
            }
        }
        
        if (e.target.name === 'instapayEmail') {
            if (e.target.value && !Tripo.validateEmail(e.target.value)) {
                showFieldError(e.target, 'البريد الإلكتروني غير صحيح');
            } else {
                clearFieldError(e.target);
            }
        }
    }, true);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Process payment
function processPayment() {
    console.log('processPayment called'); // Debug
    
    const form = document.getElementById('paymentForm');
    if (!form) {
        console.error('Form not found!');
        showNotification('خطأ: لم يتم العثور على النموذج', 'error');
        return;
    }
    
    const formData = new FormData(form);
    
    console.log('Form data entries:'); // Debug
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'nationalId'];
    for (let field of requiredFields) {
        const element = document.getElementById(field);
        if (!element || !element.value || element.value.trim() === '') {
            console.log(`Missing field: ${field}`); // Debug
            showNotification(`يرجى ملء حقل ${getFieldDisplayName(field)}`, 'error');
            element?.focus();
            return;
        }
    }
    
    console.log('Required fields validation passed'); // Debug
    
    // Validate phone number
    const phone = document.getElementById('phone').value;
    if (!Tripo.validatePhoneNumber(phone)) {
        console.log('Invalid phone number:', phone); // Debug
        showNotification('رقم الموبايل غير صحيح. يجب أن يبدأ بـ 010, 011, 012, أو 015', 'error');
        document.getElementById('phone').focus();
        return;
    }
    
    // Validate national ID
    const nationalId = document.getElementById('nationalId').value;
    if (!Tripo.validateNationalId(nationalId)) {
        console.log('Invalid national ID:', nationalId); // Debug
        showNotification('رقم البطاقة الشخصية يجب أن يكون 14 رقم', 'error');
        document.getElementById('nationalId').focus();
        return;
    }
    
    // Check terms acceptance
    const termsCheckbox = document.getElementById('agreeTerms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        console.log('Terms not accepted'); // Debug
        showNotification('يجب الموافقة على الشروط والأحكام', 'error');
        termsCheckbox?.focus();
        return;
    }
    
    // Additional validation based on payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    console.log('Payment method:', paymentMethod); // Debug
    if (!validatePaymentMethod(paymentMethod, formData)) {
        return;
    }
    
    console.log('All validations passed, processing booking...'); // Debug
    
    // Show loading
    showNotification('جاري معالجة الطلب...', 'info', 5000);
    
    // Simulate payment processing
    setTimeout(() => {
        processBooking(formData);
    }, 2000);
}

function getFieldDisplayName(field) {
    const names = {
        'fullName': 'الاسم الكامل',
        'phone': 'رقم الموبايل',
        'nationalId': 'رقم البطاقة الشخصية'
    };
    return names[field] || field;
}

function validatePaymentMethod(method, formData) {
    if (!method) {
        showNotification('يرجى اختيار طريقة دفع', 'error');
        return false;
    }
    
    switch (method) {
        case 'vodafone-cash':
            const senderNumberEl = document.getElementById('vodafoneSender');
            const senderNumber = senderNumberEl ? senderNumberEl.value : '';
            console.log('Checking vodafone sender number:', senderNumber); // Debug
            if (!senderNumber || !Tripo.validatePhoneNumber(senderNumber)) {
                showNotification('يرجى إدخال رقم المحول منه صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)', 'error');
                senderNumberEl?.focus();
                return false;
            }
            
            // Check screenshot file
            const vodafoneScreenshotEl = document.getElementById('vodafoneScreenshot');
            console.log('Vodafone screenshot element:', vodafoneScreenshotEl); // Debug
            if (vodafoneScreenshotEl) {
                console.log('Files array:', vodafoneScreenshotEl.files); // Debug
                console.log('Files length:', vodafoneScreenshotEl.files ? vodafoneScreenshotEl.files.length : 'null'); // Debug
                
                if (!vodafoneScreenshotEl.files || vodafoneScreenshotEl.files.length === 0) {
                    showNotification('يرجى رفع صورة شاشة التحويل', 'error');
                    vodafoneScreenshotEl.focus();
                    return false;
                } else {
                    console.log('File uploaded:', vodafoneScreenshotEl.files[0].name, vodafoneScreenshotEl.files[0].size); // Debug
                }
            } else {
                console.error('Vodafone screenshot element not found!'); // Debug
                showNotification('خطأ: لم يتم العثور على حقل رفع الصورة', 'error');
                return false;
            }
            break;
            
        case 'instapay':
            const instapayEmailEl = document.getElementById('instapayEmail');
            const instapayEmail = instapayEmailEl ? instapayEmailEl.value : '';
            if (!instapayEmail || !Tripo.validateEmail(instapayEmail)) {
                showNotification('يرجى إدخال البريد الإلكتروني صحيح', 'error');
                instapayEmailEl?.focus();
                return false;
            }
            
            const instapayScreenshotEl = document.getElementById('instapayScreenshot');
            if (instapayScreenshotEl && instapayScreenshotEl.hasAttribute('required')) {
                if (!instapayScreenshotEl.files || !instapayScreenshotEl.files[0]) {
                    showNotification('يرجى رفع صورة شاشة التحويل أو قم بإزالة العلامة المطلوبة للاختبار', 'warning');
                }
            }
            break;
            
        case 'bank-transfer':
            const bankScreenshotEl = document.getElementById('bankScreenshot');
            if (bankScreenshotEl && bankScreenshotEl.hasAttribute('required')) {
                if (!bankScreenshotEl.files || !bankScreenshotEl.files[0]) {
                    showNotification('يرجى رفع صورة إيصال التحويل أو قم بإزالة العلامة المطلوبة للاختبار', 'warning');
                }
            }
            break;
            
        case 'cash-on-delivery':
            // No additional validation required for cash on delivery
            break;
            
        default:
            showNotification('طريقة دفع غير صحيحة', 'error');
            return false;
    }
    
    return true;
}

// Process booking after payment validation
function processBooking(formData) {
    try {
        // Generate booking number
        const bookingNumber = Tripo.generateBookingNumber();
        
        // Calculate final total with tax
        const { subtotal, serviceFee, total } = paymentData;
        const taxAmount = Math.ceil(total * 0.14);
        const finalTotal = total + taxAmount;
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'vodafone-cash';
        
        // Create booking object with new status system
        const booking = {
            bookingNumber: bookingNumber,
            trip: {
                ...paymentData.trip,
                departureDate: paymentData.searchParams.date
            },
            searchParams: paymentData.searchParams,
            selectedSeats: paymentData.selectedSeats,
            passenger: {
                name: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value || '',
                nationalId: document.getElementById('nationalId').value
            },
            payment: {
                method: paymentMethod,
                subtotal: subtotal,
                serviceFee: serviceFee,
                taxAmount: taxAmount,
                total: finalTotal,
                status: 'pending', // All payments start as pending
                transferReceipt: getUploadedReceipt(paymentMethod),
                transferDetails: getTransferDetails(formData, paymentMethod)
            },
            status: 'pending', // All bookings start as pending
            bookedAt: new Date().toISOString(),
            canPrintTicket: false, // Cannot print until admin confirms
            paymentReference: generatePaymentReference(paymentMethod)
        };
        
        console.log('Creating booking:', booking); // Debug log
        
        // Save booking
        if (saveBooking(booking)) {
            // Save booking data for success page
            Tripo.saveToLocalStorage('completedBooking', booking);
            
            // Show success and redirect
            showNotification('تم إرسال حجزك بنجاح! سيتم مراجعته من قبل الإدارة خلال 24 ساعة.', 'success', 3000);
            
            setTimeout(() => {
                window.location.href = 'booking-success.html';
            }, 2000);
        } else {
            throw new Error('فشل في حفظ الحجز');
        }
        
    } catch (error) {
        console.error('Error processing booking:', error);
        showNotification('حدث خطأ في معالجة الحجز. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// Get uploaded receipt if available
function getUploadedReceipt(paymentMethod) {
    if (paymentMethod === 'cash-on-delivery') return null;
    
    const fileInput = document.querySelector(`#${paymentMethod}-details input[type="file"]`);
    if (fileInput && fileInput.files[0]) {
        // In a real application, you would upload this to a server
        // For demo purposes, we'll create a data URL
        return URL.createObjectURL(fileInput.files[0]);
    }
    return null;
}

// Get transfer details based on payment method
function getTransferDetails(formData, paymentMethod) {
    const details = {};
    
    switch (paymentMethod) {
        case 'vodafone-cash':
            const senderEl = document.getElementById('vodafoneSender');
            details.senderNumber = senderEl ? senderEl.value : '';
            details.transferNumber = '01012345678'; // The number they transferred to
            details.transferDate = new Date().toISOString().split('T')[0];
            details.transferTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
            break;
            
        case 'instapay':
            const emailEl = document.getElementById('instapayEmail');
            details.senderEmail = emailEl ? emailEl.value : '';
            details.receiverEmail = 'payments@tripo.com';
            details.transferDate = new Date().toISOString().split('T')[0];
            break;
            
        case 'bank-transfer':
            details.bankName = 'البنك الأهلي المصري';
            details.accountNumber = '123456789012345';
            details.transferDate = new Date().toISOString().split('T')[0];
            break;
            
        case 'cash-on-delivery':
            details.paymentLocation = 'محطة الانطلاق';
            details.instructions = 'يتم الدفع عند استلام التذكرة';
            break;
    }
    
    return details;
}

function generatePaymentReference(method) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    switch (method) {
        case 'vodafone-cash':
            return `VF${timestamp.slice(-6)}${random}`;
        case 'instapay':
            return `IP${timestamp.slice(-6)}${random}`;
        case 'bank-transfer':
            return `BT${timestamp.slice(-6)}${random}`;
        case 'cash-on-delivery':
            return `COD${timestamp.slice(-6)}${random}`;
        default:
            return `PAY${timestamp.slice(-6)}${random}`;
    }
}

// Save booking to localStorage (simulate database)
function saveBooking(booking) {
    try {
        let bookings = Tripo.loadFromLocalStorage('allBookings') || [];
        bookings.push(booking);
        Tripo.saveToLocalStorage('allBookings', bookings);
        console.log('Booking saved successfully:', booking.bookingNumber);
        console.log('Total bookings now:', bookings.length);
        
        // Also save as current booking
        Tripo.saveToLocalStorage('currentBooking', booking);
        
        return true;
    } catch (error) {
        console.error('Error saving booking:', error);
        return false;
    }
}

// Get payment method display name
function getPaymentMethodName(method) {
    const names = {
        'vodafone-cash': 'فودافون كاش',
        'instapay': 'إنستا باي',
        'bank-transfer': 'تحويل بنكي',
        'cash-on-delivery': 'كاش عند الاستلام'
    };
    
    return names[method] || method;
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePayment);
