// Main JavaScript file for Tripo website

// Global variables
let currentBooking = {};
let availableTrips = [];

// Sample data
const cities = {
    'cairo': 'القاهرة',
    'alexandria': 'الإسكندرية',
    'giza': 'الجيزة',
    'aswan': 'أسوان',
    'luxor': 'الأقصر',
    'sohag': 'سوهاج',
    'assiut': 'أسيوط',
    'minya': 'المنيا',
    'benisuef': 'بني سويف',
    'fayoum': 'الفيوم',
    'portsaid': 'بورسعيد',
    'suez': 'السويس',
    'ismailiya': 'الإسماعيلية',
    'damanhour': 'دمنهور',
    'tanta': 'طنطا',
    'mahalla': 'المحلة الكبرى',
    'zagazig': 'الزقازيق',
    'mansoura': 'المنصورة',
    'arish': 'العريش',
    'qena': 'قنا',
    'hurghada': 'الغردقة',
    'sharm': 'شرم الشيخ',
    'dahab': 'دهب',
    'marsamatrouh': 'مرسى مطروح',
    'siwa': 'سيوة'
};

const companies = {
    'horus': {
        name: 'حورس للنقل',
        logo: 'images/companies/horus.png',
        rating: 4.5
    },
    'saeed': {
        name: 'الصعيد للنقل',
        logo: 'images/companies/saeed.png',
        rating: 4.3
    },
    'gobus': {
        name: 'جو باص',
        logo: 'images/companies/gobus.png',
        rating: 4.7
    },
    'cairo-express': {
        name: 'القاهرة إكسبريس',
        logo: 'images/companies/cairo-express.png',
        rating: 4.2
    },
    'wagh-qebli': {
        name: 'وجه قبلي',
        logo: 'images/companies/wagh-qebli.png',
        rating: 4.4
    }
};

// Sample trips data
const sampleTrips = [
    {
        id: 1,
        company: 'horus',
        from: 'cairo',
        to: 'alexandria',
        departureTime: '08:00',
        arrivalTime: '11:30',
        duration: '3 ساعات 30 دقيقة',
        price: 85,
        busType: 'VIP',
        amenities: ['wifi', 'ac', 'charging'],
        stations: 2,
        availableSeats: 25
    },
    {
        id: 2,
        company: 'gobus',
        from: 'cairo',
        to: 'alexandria',
        departureTime: '10:00',
        arrivalTime: '13:00',
        duration: '3 ساعات',
        price: 95,
        busType: 'VIP',
        amenities: ['wifi', 'ac', 'charging', 'entertainment'],
        stations: 1,
        availableSeats: 18
    },
    {
        id: 3,
        company: 'saeed',
        from: 'cairo',
        to: 'aswan',
        departureTime: '20:00',
        arrivalTime: '08:30',
        duration: '12 ساعات 30 دقيقة',
        price: 150,
        busType: 'نوم',
        amenities: ['wifi', 'ac', 'charging'],
        stations: 8,
        availableSeats: 12
    },
    {
        id: 4,
        company: 'cairo-express',
        from: 'sohag',
        to: 'cairo',
        departureTime: '14:00',
        arrivalTime: '20:30',
        duration: '6 ساعات 30 دقيقة',
        price: 120,
        busType: 'الدرجة الأولى',
        amenities: ['ac', 'charging'],
        stations: 5,
        availableSeats: 22
    },
    {
        id: 5,
        company: 'wagh-qebli',
        from: 'assiut',
        to: 'cairo',
        departureTime: '06:00',
        arrivalTime: '11:30',
        duration: '5 ساعات 30 دقيقة',
        price: 100,
        busType: 'اقتصادي',
        amenities: ['ac'],
        stations: 4,
        availableSeats: 30
    }
];

// Utility functions
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('ar-EG', options);
}

function formatPrice(price) {
    return price.toLocaleString('ar-EG') + ' ج.م';
}

function generateBookingNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `TR${year}-${random}`;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Search functionality
function searchTrips() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const dateInput = document.getElementById('date');
    
    const from = fromInput ? fromInput.getAttribute('data-city-key') || fromInput.value.trim() : '';
    const to = toInput ? toInput.getAttribute('data-city-key') || toInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';

    if (!from || !to || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }

    // Validate city selection
    if (!fromInput.getAttribute('data-city-key')) {
        showNotification('يرجى اختيار مدينة مغادرة صحيحة من القائمة', 'error');
        return;
    }

    if (!toInput.getAttribute('data-city-key')) {
        showNotification('يرجى اختيار مدينة وصول صحيحة من القائمة', 'error');
        return;
    }

    if (from === to) {
        showNotification('محافظة المغادرة والوصول لا يمكن أن تكون نفسها', 'error');
        return;
    }

    // Validate date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('لا يمكن اختيار تاريخ سابق لليوم', 'error');
        return;
    }

    // Save search parameters
    const searchParams = { 
        from, 
        to, 
        date, 
        returnDate: null,
        tripType: 'oneway'
    };
    saveToLocalStorage('searchParams', searchParams);

    // Redirect to search results with URL parameters
    const urlParams = new URLSearchParams({
        from: from,
        to: to,
        date: date,
        passengers: '1'
    });
    window.location.href = `search-results.html?${urlParams.toString()}`;
}

// Helper function to get city key from name or key
function getCityKey(input) {
    if (!input) return null;
    
    // Check if input is already a valid key
    if (cities[input]) {
        return input;
    }
    
    // Search for city by Arabic name
    for (const [key, name] of Object.entries(cities)) {
        if (name === input || name.includes(input) || input.includes(name)) {
            return key;
        }
    }
    
    return null;
}

// Helper function to get city name from key
function getCityName(key) {
    return cities[key] || key;
}

// Initialize city autocomplete functionality
function initializeCityAutocomplete() {
    const fromWrapper = document.querySelector('.from-field .custom-select-wrapper');
    const toWrapper = document.querySelector('.to-field .custom-select-wrapper');
    
    if (fromWrapper) {
        setupCustomSelect(fromWrapper, 'from');
    }
    
    if (toWrapper) {
        setupCustomSelect(toWrapper, 'to');
    }
}

// Setup custom select dropdown
function setupCustomSelect(wrapper, fieldType) {
    const input = wrapper.querySelector('.custom-select-input');
    const dropdown = wrapper.querySelector('.custom-select-dropdown');
    const searchInput = wrapper.querySelector('.search-input');
    const options = wrapper.querySelectorAll('.custom-select-options li');
    
    if (!input || !dropdown) return;
    
    let selectedValue = '';
    let isOpen = false;
    
    // Handle input click to toggle dropdown
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });
    
    // Handle search input
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterOptions(this.value);
        });
        
        searchInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', function() {
            selectOption(this);
        });
        
        option.addEventListener('mouseenter', function() {
            highlightOption(this);
        });
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', function(e) {
        if (!isOpen && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            openDropdown();
            return;
        }
        
        if (isOpen) {
            handleKeyboardNavigation(e);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            closeDropdown();
        }
    });
    
    function toggleDropdown() {
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }
    
    function openDropdown() {
        wrapper.classList.add('open');
        isOpen = true;
        if (searchInput) {
            searchInput.focus();
            searchInput.value = '';
        }
        filterOptions('');
    }
    
    function closeDropdown() {
        wrapper.classList.remove('open');
        isOpen = false;
        if (searchInput) {
            searchInput.value = '';
        }
    }
    
    function selectOption(option) {
        const value = option.getAttribute('data-value');
        const text = option.textContent;
        
        input.value = text;
        input.setAttribute('data-city-key', value);
        selectedValue = value;
        
        // Update selected state
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        closeDropdown();
        
        // Trigger change event
        input.dispatchEvent(new Event('change'));
    }
    
    function highlightOption(option) {
        options.forEach(opt => opt.classList.remove('highlighted'));
        option.classList.add('highlighted');
    }
    
    function filterOptions(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            const value = option.getAttribute('data-value').toLowerCase();
            
            if (!term || text.includes(term) || value.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    function handleKeyboardNavigation(e) {
        const visibleOptions = Array.from(options).filter(opt => !opt.classList.contains('hidden'));
        const highlighted = wrapper.querySelector('.custom-select-options li.highlighted');
        let currentIndex = highlighted ? visibleOptions.indexOf(highlighted) : -1;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, visibleOptions.length - 1);
                if (visibleOptions[currentIndex]) {
                    highlightOption(visibleOptions[currentIndex]);
                    visibleOptions[currentIndex].scrollIntoView({ block: 'nearest' });
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                if (visibleOptions[currentIndex]) {
                    highlightOption(visibleOptions[currentIndex]);
                    visibleOptions[currentIndex].scrollIntoView({ block: 'nearest' });
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (highlighted) {
                    selectOption(highlighted);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                closeDropdown();
                input.focus();
                break;
        }
    }
}

function quickSearch(from, to) {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    
    const searchParams = {
        from: from,
        to: to,
        date: today,
        passengers: '1'
    };
    
    saveToLocalStorage('searchParams', searchParams);
    window.location.href = 'search-results.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

// Initialize page
function initializePage() {
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.value = today;
        
        // Initialize custom date display
        initializeDateInput();
    }

    // Load current booking if exists
    currentBooking = loadFromLocalStorage('currentBooking') || {};
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize search tabs
    initializeSearchTabs();
    
    // Initialize city autocomplete
    initializeCityAutocomplete();
    
    // Add loading animations
    addLoadingAnimations();
}

// Initialize custom date input
function initializeDateInput() {
    const dateDisplay = document.getElementById('date-display');
    const customCalendar = document.getElementById('custom-calendar');
    const hiddenInput = document.getElementById('date');
    const dateText = dateDisplay?.querySelector('.date-text');
    
    if (!dateDisplay || !customCalendar || !hiddenInput || !dateText) return;
    
    // Calendar state
    let currentDate = new Date();
    let selectedDate = null;
    let isCalendarOpen = false;
    
    // Arabic month names
    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // Initialize
    const today = new Date();
    hiddenInput.setAttribute('min', today.toISOString().split('T')[0]);
    selectedDate = today;
    updateDateDisplay();
    updateHiddenInput();
    
    // Event listeners
    dateDisplay.addEventListener('click', toggleCalendar);
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('calendar-today').addEventListener('click', () => {
        selectDate(new Date());
        closeCalendar();
    });
    
    document.getElementById('calendar-close').addEventListener('click', closeCalendar);
    
    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
        if (!customCalendar.contains(e.target) && !dateDisplay.contains(e.target)) {
            closeCalendar();
        }
    });
    
    // Initialize calendar
    renderCalendar();
    
    function toggleCalendar() {
        if (isCalendarOpen) {
            closeCalendar();
        } else {
            openCalendar();
        }
    }
    
    function openCalendar() {
        customCalendar.classList.add('open');
        dateDisplay.classList.add('active');
        isCalendarOpen = true;
        
        // Set current date to selected date or today
        if (selectedDate) {
            currentDate = new Date(selectedDate);
        } else {
            currentDate = new Date();
        }
        renderCalendar();
    }
    
    function closeCalendar() {
        customCalendar.classList.remove('open');
        dateDisplay.classList.remove('active');
        isCalendarOpen = false;
    }
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update title
        document.querySelector('.month-year').textContent = `${arabicMonths[month]} ${year}`;
        
        // Clear days container
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get previous month's last days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        // Add previous month's trailing days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const dayElement = createDayElement(dayNum, true, new Date(year, month - 1, dayNum));
            daysContainer.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const dayElement = createDayElement(day, false, dayDate);
            daysContainer.appendChild(dayElement);
        }
        
        // Add next month's leading days
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= Math.min(remainingCells, 14); day++) {
            const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
            daysContainer.appendChild(dayElement);
        }
    }
    
    function createDayElement(dayNum, isOtherMonth, dayDate) {
        const dayElement = document.createElement('button');
        dayElement.type = 'button';
        dayElement.className = 'calendar-day';
        dayElement.textContent = dayNum;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Check if it's today
        const today = new Date();
        if (dayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check if it's selected
        if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        // Check if it's disabled (before today)
        if (dayDate < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
            dayElement.disabled = true;
        } else {
            dayElement.addEventListener('click', () => {
                if (!isOtherMonth) {
                    selectDate(dayDate);
                    closeCalendar();
                } else {
                    // Navigate to other month and select
                    currentDate = new Date(dayDate);
                    selectDate(dayDate);
                    renderCalendar();
                }
            });
        }
        
        return dayElement;
    }
    
    function selectDate(date) {
        selectedDate = new Date(date);
        updateDateDisplay();
        updateHiddenInput();
        renderCalendar();
    }
    
    function updateDateDisplay() {
        if (selectedDate) {
            const formattedDate = formatDateForDisplay(selectedDate);
            dateText.textContent = formattedDate;
            dateText.classList.remove('placeholder');
        } else {
            dateText.textContent = 'اختر تاريخ السفر';
            dateText.classList.add('placeholder');
        }
    }
    
    function updateHiddenInput() {
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            hiddenInput.value = `${year}-${month}-${day}`;
            
            // Trigger change event
            hiddenInput.dispatchEvent(new Event('change'));
        }
    }
}

// Format date for display in Arabic
function formatDateForDisplay(date) {
    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const arabicDays = [
        'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];
    
    const dayName = arabicDays[date.getDay()];
    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}، ${day} ${month} ${year}`;
}

// Initialize search tabs
function initializeSearchTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');
        });
    });
}

// Swap locations function
function swapLocations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if (!fromInput || !toInput) return;
    
    const fromValue = fromInput.value;
    const toValue = toInput.value;
    const fromKey = fromInput.getAttribute('data-city-key');
    const toKey = toInput.getAttribute('data-city-key');
    
    // Swap values
    fromInput.value = toValue;
    toInput.value = fromValue;
    
    // Swap data attributes
    if (toKey) {
        fromInput.setAttribute('data-city-key', toKey);
    } else {
        fromInput.removeAttribute('data-city-key');
    }
    
    if (fromKey) {
        toInput.setAttribute('data-city-key', fromKey);
    } else {
        toInput.removeAttribute('data-city-key');
    }
    
    // Update selected states in dropdowns
    updateSelectedStates(fromInput, toKey);
    updateSelectedStates(toInput, fromKey);
    
    // Add animation effect
    const swapBtn = document.querySelector('.swap-btn');
    if (swapBtn) {
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = 'rotate(0deg)';
        }, 300);
    }
}

// Helper function to update selected states in dropdown
function updateSelectedStates(input, cityKey) {
    const wrapper = input.closest('.custom-select-wrapper');
    if (!wrapper) return;
    
    const options = wrapper.querySelectorAll('.custom-select-options li');
    options.forEach(option => {
        option.classList.remove('selected');
        if (cityKey && option.getAttribute('data-value') === cityKey) {
            option.classList.add('selected');
        }
    });
}

function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

function addLoadingAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.feature-card, .route-card, .trip-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// Copy functionality
function copyBookingNumber() {
    const bookingNumber = document.querySelector('.reference-number').textContent;
    navigator.clipboard.writeText(bookingNumber).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.style.background = '#667eea';
        }, 2000);
    });
}

// Download and share functionality
function downloadTicket() {
    // In a real app, this would generate and download a PDF ticket
    showNotification('سيتم تحميل التذكرة قريباً...', 'info', 3000);
}

function shareBooking() {
    if (navigator.share) {
        navigator.share({
            title: 'حجز Tripo',
            text: 'تم حجز رحلتي بنجاح مع Tripo',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('تم نسخ رابط الحجز', 'success', 2000);
        });
    }
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications of the same type
    const existingNotifications = document.querySelectorAll(`.notification.${type}`);
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-message">
                ${message}
            </div>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    
    // Add to notifications container or create one
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        const progressBar = notification.querySelector('.notification-progress-bar');
        progressBar.style.animationDuration = `${duration}ms`;
        
        setTimeout(() => {
            closeNotification(notification.querySelector('.notification-close'));
        }, duration);
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.add('hide');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Backward compatibility functions
function showError(message) {
    showNotification(message, 'error', 5000);
}

function showSuccess(message) {
    showNotification(message, 'success', 4000);
}

function showWarning(message) {
    showNotification(message, 'warning', 5000);
}

// Loading spinner
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Form validation
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Phone number validation
function validatePhoneNumber(phone) {
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phone);
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// National ID validation
function validateNationalId(id) {
    return id.length === 14 && /^\d+$/.test(id);
}

// Accessibility improvements
function enhanceAccessibility() {
    // Add keyboard navigation for custom elements
    const clickableElements = document.querySelectorAll('.route-card, .trip-card, .seat');
    
    clickableElements.forEach(element => {
        if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
    
    // Add ARIA labels where needed
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (button.textContent.trim()) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
}

// Performance optimizations
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add loading="lazy" for images below the fold
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add error handling
        img.addEventListener('error', () => {
            img.src = 'images/placeholder.png';
        });
    });
}

// PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    enhanceAccessibility();
    optimizeImages();
    initHeaderScroll();
    initMobileMenu();
    initSmoothScrolling();
});

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    
    function openMobileMenu() {
        mobileNav.classList.add('open');
        mobileNavOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }
    
    function closeMobileMenu() {
        mobileNav.classList.remove('open');
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    
    if (mobileMenuBtn && mobileNav && mobileNavOverlay) {
        // Toggle menu on button click
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mobileNav.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close menu when clicking on overlay
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
        
        // Close mobile menu when clicking on links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                closeMobileMenu();
            }
        });
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    updateActiveLink(this);
                }
            });
        }
    });
}

// Update active navigation link
function updateActiveLink(clickedLink) {
    const allNavLinks = document.querySelectorAll('.nav-link');
    
    allNavLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Find corresponding desktop link if mobile link was clicked
    const href = clickedLink.getAttribute('href');
    const desktopLink = document.querySelector(`.nav-links a[href="${href}"]`);
    
    if (desktopLink) {
        desktopLink.classList.add('active');
    } else {
        clickedLink.classList.add('active');
    }
}

// Handle back button
window.addEventListener('popstate', () => {
    // Handle navigation state if needed
});

// Handle online/offline status
window.addEventListener('online', () => {
    showSuccess('تم استعادة الاتصال بالإنترنت');
});

window.addEventListener('offline', () => {
    showError('انقطع الاتصال بالإنترنت. بعض الميزات قد لا تعمل.');
});

// Scroll to search function for CTA button
function scrollToSearch() {
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
        searchSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Scroll to features function for scroll indicator
function scrollToFeatures() {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        const headerHeight = 80;
        const targetPosition = featuresSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Swap locations function for hero search
function swapLocations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if (fromInput && toInput) {
        const fromValue = fromInput.value;
        const toValue = toInput.value;
        const fromKey = fromInput.getAttribute('data-city-key');
        const toKey = toInput.getAttribute('data-city-key');
        
        // Swap values
        fromInput.value = toValue;
        toInput.value = fromValue;
        
        // Swap data attributes
        if (toKey) {
            fromInput.setAttribute('data-city-key', toKey);
        } else {
            fromInput.removeAttribute('data-city-key');
        }
        
        if (fromKey) {
            toInput.setAttribute('data-city-key', fromKey);
        } else {
            toInput.removeAttribute('data-city-key');
        }
        
        // Update selected states in dropdowns
        updateSelectedStates(fromInput, toKey);
        updateSelectedStates(toInput, fromKey);
        
        // Add animation effect
        const swapBtn = document.querySelector('.swap-btn');
        if (swapBtn) {
            swapBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                swapBtn.style.transform = 'rotate(0deg)';
            }, 300);
        }
    }
}

// Export functions for use in other files
window.Tripo = {
    searchTrips,
    quickSearch,
    goToHome,
    formatDate,
    formatDateForDisplay,
    formatPrice,
    generateBookingNumber,
    saveToLocalStorage,
    loadFromLocalStorage,
    showError,
    showSuccess,
    showWarning,
    showNotification,
    closeNotification,
    showLoading,
    hideLoading,
    validateForm,
    validatePhoneNumber,
    validateEmail,
    validateNationalId,
    copyBookingNumber,
    downloadTicket,
    shareBooking,
    scrollToSearch,
    scrollToFeatures,
    swapLocations,
    getCityKey,
    getCityName,
    initializeCityAutocomplete,
    initializeDateInput,
    setupCustomSelect,
    updateSelectedStates,
    cities,
    companies,
    sampleTrips
};
