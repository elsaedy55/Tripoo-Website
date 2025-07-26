// Seat Selection Page JavaScript

let selectedSeats = [];
let seatPrices = {};
let busLayout = {};

// Initialize seat selection page
function initializeSeatSelection() {
    loadTripData();
    generateSeatMap();
    updateBookingSummary();
    setupSeatTooltip();
}

// Load trip data from localStorage
function loadTripData() {
    const trip = Tripo.loadFromLocalStorage('selectedTrip');
    const searchParams = Tripo.loadFromLocalStorage('searchParams');
    
    if (!trip || !searchParams) {
        window.location.href = 'search-results.html';
        return;
    }
    
    // Update trip info header
    const company = Tripo.companies[trip.company];
    document.getElementById('companyName').textContent = company.name;
    document.getElementById('departureCity').textContent = Tripo.cities[trip.from];
    document.getElementById('arrivalCity').textContent = Tripo.cities[trip.to];
    document.getElementById('departureTime').textContent = trip.departureTime;
    document.getElementById('arrivalTime').textContent = trip.arrivalTime;
    document.getElementById('duration').textContent = `(${trip.duration})`;
    document.getElementById('busClass').textContent = trip.busType;
    
    // Set company logo
    const companyLogo = document.getElementById('companyLogo');
    companyLogo.src = company.logo;
    companyLogo.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2N2VlYSIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pgo8L3N2Zz4=';
    };
    
    // Update booking summary
    document.getElementById('summaryRoute').textContent = 
        `${Tripo.cities[trip.from]} → ${Tripo.cities[trip.to]}`;
    document.getElementById('summaryDate').textContent = Tripo.formatDate(searchParams.date);
    document.getElementById('summaryTime').textContent = 
        `${trip.departureTime} - ${trip.arrivalTime}`;
    document.getElementById('summaryCompany').textContent = company.name;
    
    // Add passenger count information
    const passengersInfo = document.createElement('div');
    passengersInfo.className = 'passengers-info';
    passengersInfo.innerHTML = `
        
    `;
    document.querySelector('.trip-summary-card').appendChild(passengersInfo);
    
    // Update page title based on passenger count
    const titleElement = document.getElementById('seatSelectionTitle');
    if (parseInt(searchParams.passengers) > 1) {
        titleElement.textContent = `اختر ${searchParams.passengers} مقاعد للركاب`;
    } else {
        titleElement.textContent = 'اختر مقعدك';
    }
}

// Generate seat map based on bus type
function generateSeatMap() {
    const trip = Tripo.loadFromLocalStorage('selectedTrip');
    const seatsContainer = document.getElementById('seatsContainer');
    
    // Bus layout: 2-2 configuration (like in the image)
    const layout = {
        rows: 13, // 13 rows as shown in image
        seatsPerRow: 4, // 2 seats on each side
        leftSeats: 2, // 2 seats on left side
        rightSeats: 2 // 2 seats on right side
    };
    
    busLayout = layout;
    
    // Generate seat prices based on position
    generateSeatPrices(trip.price, layout);
    
    let seatHTML = '';
    let seatCounter = 1; // Start counting from 1
    
    for (let row = 1; row <= layout.rows; row++) {
        // Left side seats (1, 2 in first row, then 5, 6, etc.)
        for (let leftSeat = 1; leftSeat <= layout.leftSeats; leftSeat++) {
            const seatNumber = seatCounter;
            const seatClass = getSeatClass(seatNumber, layout);
            const isOccupied = Math.random() < 0.25; // 25% chance of being occupied
            const price = seatPrices[seatNumber];
            
            seatHTML += `
                <div class="seat ${seatClass} ${isOccupied ? 'occupied' : 'available'}" 
                     data-seat="${seatNumber}" 
                     data-price="${price}"
                     onclick="${isOccupied ? '' : 'toggleSeat(this)'}"
                     onmouseenter="showSeatTooltip(event, '${seatNumber}', ${price})"
                     onmouseleave="hideSeatTooltip()">
                    ${seatNumber}
                </div>
            `;
            seatCounter++;
        }
        
        // Aisle space
        seatHTML += '<div class="aisle-space"></div>';
        
        // Right side seats (3, 4 in first row, then 7, 8, etc.)
        for (let rightSeat = 1; rightSeat <= layout.rightSeats; rightSeat++) {
            const seatNumber = seatCounter;
            const seatClass = getSeatClass(seatNumber, layout);
            const isOccupied = Math.random() < 0.25; // 25% chance of being occupied
            const price = seatPrices[seatNumber];
            
            seatHTML += `
                <div class="seat ${seatClass} ${isOccupied ? 'occupied' : 'available'}" 
                     data-seat="${seatNumber}" 
                     data-price="${price}"
                     onclick="${isOccupied ? '' : 'toggleSeat(this)'}"
                     onmouseenter="showSeatTooltip(event, '${seatNumber}', ${price})"
                     onmouseleave="hideSeatTooltip()">
                    ${seatNumber}
                </div>
            `;
            seatCounter++;
        }
    }
    
    seatsContainer.innerHTML = seatHTML;
    
    // Update pricing legend
    updatePricingLegend();
}

// Update pricing legend with actual prices
function updatePricingLegend() {
    const trip = Tripo.loadFromLocalStorage('selectedTrip');
    const basePrice = trip.price;
    
    // Calculate example prices
    const aislePrice = basePrice;
    const windowPrice = basePrice + 25;
    const premiumAislePrice = basePrice + 60;
    const premiumWindowPrice = basePrice + 80;
    
    // Update price displays
    document.getElementById('aislePrice').textContent = Tripo.formatPrice(aislePrice);
    document.getElementById('windowPrice').textContent = Tripo.formatPrice(windowPrice);
    document.getElementById('premiumAislePrice').textContent = Tripo.formatPrice(premiumAislePrice);
    document.getElementById('premiumWindowPrice').textContent = Tripo.formatPrice(premiumWindowPrice);
}

// Get seat class based on seat number
function getSeatClass(seatNumber, layout) {
    const classes = [];
    
    // Premium seats (seats 1, 2, 3, 4)
    if (seatNumber <= 4) {
        classes.push('premium');
    }
    
    return classes.join(' ');
}

// Generate seat prices based on position and base price
function generateSeatPrices(basePrice, layout) {
    seatPrices = {};
    
    const totalSeats = layout.rows * layout.seatsPerRow;
    
    for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
        let price = basePrice;
        
        // Premium seats (seats 1, 2, 3, 4) - special pricing
        if (seatNumber <= 4) {
            const positionInRow = ((seatNumber - 1) % 4) + 1;
            if (positionInRow === 1 || positionInRow === 4) {
                // Premium window seats (1, 4)
                price = basePrice + 80;
            } else {
                // Premium aisle seats (2, 3)
                price = basePrice + 60;
            }
        } else {
            // Regular seats - unified pricing by position type
            const positionInRow = ((seatNumber - 1) % 4) + 1;
            if (positionInRow === 1 || positionInRow === 4) {
                // Window seats - same price
                price = basePrice + 25;
            } else {
                // Aisle seats - same price (cheaper than window)
                price = basePrice;
            }
        }
        
        seatPrices[seatNumber] = price;
    }
}

// Toggle seat selection
function toggleSeat(seatElement) {
    const seatNumber = seatElement.dataset.seat;
    const price = parseInt(seatElement.dataset.price);
    
    if (seatElement.classList.contains('selected')) {
        // Deselect seat
        seatElement.classList.remove('selected');
        selectedSeats = selectedSeats.filter(seat => seat.number !== seatNumber);
    } else {
        // Select seat
        const searchParams = Tripo.loadFromLocalStorage('searchParams');
        const maxSeats = parseInt(searchParams.passengers);
        
        if (selectedSeats.length >= maxSeats) {
            Tripo.showNotification(`يمكنك اختيار ${maxSeats} مقعد فقط حسب عدد الركاب المحدد في البحث`, 'warning');
            return;
        }
        
        seatElement.classList.add('selected');
        selectedSeats.push({
            number: seatNumber,
            price: price
        });
        
        // Show encouraging message when selecting multiple seats
        if (selectedSeats.length > 1 && selectedSeats.length < maxSeats) {
            Tripo.showNotification(`تم اختيار ${selectedSeats.length} مقعد من أصل ${maxSeats}`, 'success', 3000);
        } else if (selectedSeats.length === maxSeats) {
            Tripo.showNotification(`✅ تم اختيار جميع المقاعد المطلوبة!`, 'success', 4000);
        }
    }
    
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    const seatsList = document.getElementById('seatsList');
    const subtotalElement = document.getElementById('subtotal');
    const serviceFeeElement = document.getElementById('serviceFee');
    const totalPriceElement = document.getElementById('totalPrice');
    const bookNowBtn = document.getElementById('bookNowBtn');
    
    if (selectedSeats.length === 0) {
        seatsList.innerHTML = `<p class="no-seats">اختر مقعد أو أكثر للمتابعة</p>`;
        subtotalElement.textContent = '0 ج.م';
        serviceFeeElement.textContent = '0 ج.م';
        totalPriceElement.textContent = '0 ج.م';
        bookNowBtn.disabled = true;
        return;
    }
    
    // Display selected seats with seat type
    let seatsHTML = '';
    
    for (let i = 0; i < selectedSeats.length; i++) {
        const seat = selectedSeats[i];
        const seatNum = parseInt(seat.number);
        const positionInRow = ((seatNum - 1) % 4) + 1;
        let seatType = '';
        
        if (seatNum <= 4) {
            seatType = (positionInRow === 1 || positionInRow === 4) ? '(مميز - نافذة)' : '(مميز - ممر)';
        } else {
            seatType = (positionInRow === 1 || positionInRow === 4) ? '(نافذة)' : '(ممر)';
        }
        
        seatsHTML += `
            <div class="seat-item" data-seat-index="${i}">
                <div class="seat-details">
                    <span class="seat-number">مقعد ${seat.number}</span>
                    <span class="seat-type">${seatType}</span>
                </div>
                <span class="seat-price">${Tripo.formatPrice(seat.price)}</span>
            </div>
        `;
    }
    
    seatsList.innerHTML = seatsHTML;
    
    // Update selected seats title
    const selectedSeatsTitle = document.getElementById('selectedSeatsTitle');
    if (selectedSeats.length === 1) {
        selectedSeatsTitle.textContent = 'المقعد المحدد';
    } else {
        selectedSeatsTitle.textContent = `المقاعد المحددة (${selectedSeats.length})`;
    }
    
    // Calculate prices
    const subtotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    const serviceFee = 0; // No service fee from customer
    const total = subtotal + serviceFee;
    
    subtotalElement.textContent = Tripo.formatPrice(subtotal);
    serviceFeeElement.textContent = Tripo.formatPrice(serviceFee);
    totalPriceElement.textContent = Tripo.formatPrice(total);
    
    // Enable booking when at least one seat is selected
    bookNowBtn.disabled = selectedSeats.length === 0;
    
    // Update button text
    if (selectedSeats.length > 0) {
        bookNowBtn.textContent = `احجز ${selectedSeats.length} تذكرة`;
    } else {
        bookNowBtn.textContent = `اختر مقاعد للمتابعة`;
    }
}

// Setup seat tooltip
function setupSeatTooltip() {
    // Tooltip is handled by onmouseenter/onmouseleave events in the HTML
}

function showSeatTooltip(event, seatNumber, price) {
    const tooltip = document.getElementById('seatTooltip');
    const seatNumberElement = tooltip.querySelector('.seat-number');
    const seatPriceElement = tooltip.querySelector('.seat-price');
    const seatFeaturesElement = tooltip.querySelector('.seat-features');
    
    seatNumberElement.textContent = `مقعد ${seatNumber}`;
    seatPriceElement.textContent = Tripo.formatPrice(price);
    
    // Determine seat type based on number
    const features = [];
    const seatNum = parseInt(seatNumber);
    const positionInRow = ((seatNum - 1) % 4) + 1;
    
    // Check if premium seat
    if (seatNum <= 4) {
        features.push('مقعد مميز');
    }
    
    // Check if window or aisle seat
    if (positionInRow === 1 || positionInRow === 4) {
        features.push('مقعد نافذة');
        features.push('إطلالة خارجية');
    } else {
        features.push('مقعد ممر');
        features.push('سهولة الحركة');
    }
    
    seatFeaturesElement.textContent = features.join(' • ');
    
    // Position tooltip
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 60 + 'px';
    tooltip.classList.add('show');
}

function hideSeatTooltip() {
    const tooltip = document.getElementById('seatTooltip');
    tooltip.classList.remove('show');
}

// Proceed to payment
function proceedToPayment() {
    if (selectedSeats.length === 0) {
        Tripo.showError('يرجى اختيار مقعد واحد على الأقل');
        return;
    }
    
    // Save selected seats and booking info
    const bookingData = {
        trip: Tripo.loadFromLocalStorage('selectedTrip'),
        searchParams: Tripo.loadFromLocalStorage('searchParams'),
        selectedSeats: selectedSeats,
        subtotal: selectedSeats.reduce((total, seat) => total + seat.price, 0),
        serviceFee: Math.ceil(selectedSeats.reduce((total, seat) => total + seat.price, 0) * 0.05),
        total: selectedSeats.reduce((total, seat) => total + seat.price, 0) + 
               Math.ceil(selectedSeats.reduce((total, seat) => total + seat.price, 0) * 0.05)
    };
    
    Tripo.saveToLocalStorage('bookingData', bookingData);
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSeatSelection);
