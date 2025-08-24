/**
 * Search Results Page JavaScript
 * Handles trip display, date navigation, and search parameters
 */

class SearchResultsManager {
    constructor() {
        this.searchParams = null;
        this.currentDate = null;
        this.trips = [];
        this.filteredTrips = [];
        this.sortBy = 'best-deal';
        
        this.sortOptions = {
            'best-deal': { 
                name: 'أفضل صفقة', 
                description: 'توازن مثالي بين السعر والجودة',
                icon: 'fas fa-medal'
            },
            'cheapest': { 
                name: 'الأرخص', 
                description: 'أقل الأسعار المتاحة',
                icon: 'fas fa-dollar-sign'
            },
            'fastest': { 
                name: 'الأسرع', 
                description: 'أقل وقت للوصول',
                icon: 'fas fa-tachometer-alt'
            },
            'discounts': { 
                name: 'الخصومات', 
                description: 'الرحلات التي تحتوي على خصومات',
                icon: 'fas fa-tags'
            }
        };
        
        this.cityNames = {
            'cairo': 'القاهرة',
            'alexandria': 'الإسكندرية',
            'hurghada': 'الغردقة',
            'luxor': 'الأقصر',
            'aswan': 'أسوان',
            'assiut': 'أسيوط',
            'sharm': 'شرم الشيخ',
            'dahab': 'دهب',
            'marsa-alam': 'مرسى علم',
            'taba': 'طابا',
            'nuweiba': 'نويبع',
            'safaga': 'سفاجا',
            'qena': 'قنا',
            'sohag': 'سوهاج',
            'minya': 'المنيا',
            'fayoum': 'الفيوم',
            'beni-suef': 'بني سويف',
            'ismailia': 'الإسماعيلية',
            'suez': 'السويس',
            'port-said': 'بورسعيد',
            'damietta': 'دمياط',
            'mansoura': 'المنصورة',
            'zagazig': 'الزقازيق',
            'tanta': 'طنطا'
        };
        
        this.companies = [
            { name: 'حورس للنقل', color: '#1e40af', logo: '🚌' },
            { name: 'الصعيد للنقل', color: '#dc2626', logo: '🏜️' },
            { name: 'جو باص', color: '#059669', logo: '⚡' },
            { name: 'القاهرة إكسبريس', color: '#7c3aed', logo: '🏛️' },
            { name: 'وجه قبلي', color: '#ea580c', logo: '🌴' },
            { name: 'سيناء للنقل', color: '#0891b2', logo: '🏔️' },
            { name: 'الدلتا للنقل', color: '#16a34a', logo: '🌾' }
        ];
        
        this.busTypes = ['VIP', 'الدرجة الأولى', 'اقتصادي'];
        this.amenities = ['wifi', 'ac', 'meal', 'charging', 'entertainment'];
        
        this.init();
    }
    
    init() {
        this.loadSearchParams();
        this.updateUI();
        this.generateTrips();
        this.displayTrips();
        this.setupEventListeners();
        this.updateResultsCount();
        this.setupModalFunctions();
        this.initializeSortModal();
    }
    
    initializeSortModal() {
        // Set default active sort option pill
        this.updateSortPillsState();
    }
    
    updateSortPillsState() {
        console.log('Updating sort pills state for:', this.sortBy);
        
        // Remove active class from all pills
        document.querySelectorAll('.sort-option-pill').forEach(pill => {
            pill.classList.remove('active');
        });
        
        // Add active class to current sort pill
        const activePill = document.querySelector(`.sort-option-pill[data-sort="${this.sortBy}"]`);
        console.log('Found active pill:', activePill);
        if (activePill) {
            activePill.classList.add('active');
            
            // Scroll the active pill into view if needed
            this.scrollPillIntoView(activePill);
        }
    }
    
    scrollPillIntoView(pill) {
        const container = document.querySelector('.sort-options-scroll');
        if (container && pill) {
            const containerRect = container.getBoundingClientRect();
            const pillRect = pill.getBoundingClientRect();
            
            if (pillRect.right > containerRect.right || pillRect.left < containerRect.left) {
                pill.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'center' 
                });
            }
        }
    }
    
    setupModalFunctions() {
        // Add modal functions to window object for HTML onclick events
        window.openSortModal = () => this.openSortModal();
        window.closeSortModal = () => this.closeSortModal();
    }
    
    openSortModal() {
        const modal = document.getElementById('sortModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeSortModal() {
        const modal = document.getElementById('sortModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    loadSearchParams() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('from') || urlParams.has('to')) {
                this.searchParams = {
                    from: urlParams.get('from'),
                    to: urlParams.get('to'),
                    date: urlParams.get('date'),
                    passengers: urlParams.get('passengers'),
                    type: urlParams.get('type')
                };
            } else {
                this.searchParams = JSON.parse(localStorage.getItem('searchParams'));
            }
        } catch (e) {
            console.log('No search params found');
        }
        
        // Set defaults if no search params found
        this.searchParams = this.searchParams || {};
        this.searchParams.from = this.searchParams.from || 'cairo';
        this.searchParams.to = this.searchParams.to || 'alexandria';
        
        // Set default date to Tuesday, July 22, 2025 to match HTML
        const defaultDate = '2025-07-22'; // Tuesday, July 22, 2025
        this.searchParams.date = this.searchParams.date || defaultDate;
        
        this.searchParams.passengers = this.searchParams.passengers || '1';
        this.searchParams.type = this.searchParams.type || 'one-way';
        
        this.currentDate = this.searchParams.date;
        console.log('Loaded search params:', this.searchParams);
        console.log('Current date set to:', this.currentDate);
    }
    
    getCityName(cityKey) {
        return this.cityNames[cityKey] || 
               (cityKey ? cityKey.charAt(0).toUpperCase() + cityKey.slice(1) : 'غير محدد');
    }
    
    updateUI() {
        const fromCityName = this.getCityName(this.searchParams.from);
        const toCityName = this.getCityName(this.searchParams.to);
        
        // Update city names in header
        const fromCityElement = document.getElementById('fromCity');
        const toCityElement = document.getElementById('toCity');
        
        if (fromCityElement) fromCityElement.textContent = fromCityName;
        if (toCityElement) toCityElement.textContent = toCityName;
        
        // Update date display
        this.updateDateDisplay(this.currentDate);
    }
    
    updateDateDisplay(dateStr) {
        console.log('Updating date display with:', dateStr);
        
        // Create date object safely
        let date;
        if (dateStr && dateStr !== 'null' && dateStr !== 'undefined') {
            date = new Date(dateStr);
        } else {
            date = new Date(); // Use current date as fallback
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.log('Invalid date, using current date');
            date = new Date();
        }
        
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        // Update compact date display elements (new design)
        const compactDayElement = document.querySelector('.compact-day');
        const compactDateElement = document.querySelector('.compact-date-num');
        const compactMonthElement = document.querySelector('.compact-month');
        
        console.log('Found elements:', compactDayElement, compactDateElement, compactMonthElement);
        console.log('New values:', dayNames[date.getDay()], date.getDate(), monthNames[date.getMonth()]);
        
        if (compactDayElement) compactDayElement.textContent = dayNames[date.getDay()];
        if (compactDateElement) compactDateElement.textContent = date.getDate();
        if (compactMonthElement) compactMonthElement.textContent = monthNames[date.getMonth()];
        
        // Update single compact date display (if exists)
        const compactDateDisplayElement = document.querySelector('.compact-date-display');
        if (compactDateDisplayElement) {
            const formattedDate = `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
            compactDateDisplayElement.textContent = formattedDate;
        }
        
        // Fallback for old design elements
        const dayElement = document.querySelector('.day-name');
        const dateElement = document.querySelector('.date-number');
        const monthElement = document.querySelector('.month-name');
        
        if (dayElement) dayElement.textContent = dayNames[date.getDay()];
        if (dateElement) dateElement.textContent = date.getDate();
        if (monthElement) monthElement.textContent = monthNames[date.getMonth()];
    }
    
    navigateDate(direction) {
        console.log('=== NavigateDate called ===');
        console.log('Direction:', direction);
        console.log('Current date before:', this.currentDate);
        console.log('Type of currentDate:', typeof this.currentDate);
        
        // Ensure currentDate is a string in YYYY-MM-DD format
        let currentDateStr;
        if (this.currentDate instanceof Date) {
            currentDateStr = this.currentDate.toISOString().split('T')[0];
        } else if (typeof this.currentDate === 'string') {
            currentDateStr = this.currentDate;
        } else {
            currentDateStr = new Date().toISOString().split('T')[0];
        }
        
        console.log('Current date string:', currentDateStr);
        
        // Create a new date object from current date string
        const currentDate = new Date(currentDateStr);
        
        // Check if current date is valid
        if (isNaN(currentDate.getTime())) {
            console.log('Invalid current date, using today');
            currentDate = new Date();
        }
        
        if (direction === 'prev') {
            currentDate.setDate(currentDate.getDate() - 1);
            console.log('Moving to previous day');
        } else if (direction === 'next') {
            currentDate.setDate(currentDate.getDate() + 1);
            console.log('Moving to next day');
        }
        
        // Update the current date as string
        this.currentDate = currentDate.toISOString().split('T')[0];
        console.log('New date after update:', this.currentDate);
        
        // Update the display
        console.log('Calling updateDateDisplay...');
        this.updateDateDisplay(this.currentDate);
        
        // Regenerate trips for new date
        console.log('Regenerating trips...');
        this.generateTrips();
        this.displayTrips();
        this.updateResultsCount();
        console.log('=== NavigateDate completed ===');
    }
    
    generateTrips() {
        const fromCityName = this.getCityName(this.searchParams.from);
        const toCityName = this.getCityName(this.searchParams.to);
        this.trips = [];
        
        // Generate 5-8 trips for the route
        const tripCount = Math.floor(Math.random() * 4) + 5;
        
        for (let i = 0; i < tripCount; i++) {
            const trip = this.createTrip(i, fromCityName, toCityName);
            this.trips.push(trip);
        }
        
        // Sort trips by departure time initially
        this.trips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        this.filteredTrips = [...this.trips];
        this.applySorting();
    }
    
    createTrip(index, fromCityName, toCityName) {
        const departureHour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
        const departureMinute = Math.random() < 0.5 ? 0 : 30;
        const duration = Math.floor(Math.random() * 4) + 3; // 3-6 hours
        
        const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
        const arrivalDate = new Date(`2025-01-01 ${departureTime}`);
        arrivalDate.setHours(arrivalDate.getHours() + duration);
        const arrivalTime = `${arrivalDate.getHours().toString().padStart(2, '0')}:${arrivalDate.getMinutes().toString().padStart(2, '0')}`;
        
        const company = this.companies[Math.floor(Math.random() * this.companies.length)];
        const busType = this.busTypes[Math.floor(Math.random() * this.busTypes.length)];
        const basePrice = Math.floor(Math.random() * 200) + 150; // 150-350 EGP
        const availableSeats = Math.floor(Math.random() * 20) + 5;
        const rating = (3.5 + Math.random() * 1.5).toFixed(1);
        
        // Generate discount (30% chance)
        const hasDiscount = Math.random() < 0.3;
        const discountPercent = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0; // 10-40% discount
        const originalPrice = hasDiscount ? Math.floor(basePrice / (1 - discountPercent / 100)) : basePrice;
        const finalPrice = hasDiscount ? basePrice : originalPrice;
        
        // Random amenities
        const tripAmenities = this.amenities.filter(() => Math.random() > 0.4);
        
        // Generate number of stops (0-3 stops)
        const numberOfStops = Math.floor(Math.random() * 4); // 0, 1, 2, or 3 stops
        
        const trip = {
            id: `trip-${this.searchParams.from}-${this.searchParams.to}-${index + 1}`,
            company: company.name,
            companyColor: company.color,
            companyLogo: company.logo,
            busType,
            departureTime,
            arrivalTime,
            duration: `${duration} ساعات`,
            durationHours: duration,
            price: finalPrice,
            originalPrice: hasDiscount ? originalPrice : null,
            discountPercent,
            hasDiscount,
            availableSeats,
            numberOfStops,
            fromCity: fromCityName,
            toCity: toCityName,
            route: `${fromCityName} → ${toCityName}`,
            amenities: tripAmenities,
            rating: parseFloat(rating)
        };
        
        // Calculate scores for sorting
        trip.scores = this.calculateTripScores(trip);
        
        return trip;
    }
    
    calculateTripScores(trip) {
        // Score calculation (lower is better for most metrics)
        const priceScore = trip.price / 50; // Normalize price (divide by 50)
        const durationScore = trip.durationHours / 2; // Normalize duration
        const ratingScore = (5 - trip.rating) * 2; // Invert rating (higher rating = lower score)
        const discountScore = trip.hasDiscount ? -2 : 0; // Bonus for discounts
        
        const bestDealScore = (priceScore + durationScore + ratingScore + discountScore) / 4; // Fixed division
        
        return {
            price: priceScore,
            duration: durationScore,
            rating: ratingScore,
            discount: discountScore,
            bestDeal: bestDealScore
        };
    }
    
    applySorting() {
        const sortFunctions = {
            'cheapest': (a, b) => a.price - b.price,
            'fastest': (a, b) => a.durationHours - b.durationHours,
            'discounts': (a, b) => {
                // First sort by discount availability, then by discount percentage
                if (a.hasDiscount !== b.hasDiscount) {
                    return b.hasDiscount - a.hasDiscount; // Discounted trips first
                }
                if (a.hasDiscount && b.hasDiscount) {
                    return b.discountPercent - a.discountPercent; // Higher discount first
                }
                return a.price - b.price; // Then by price
            },
            'best-deal': (a, b) => a.scores.bestDeal - b.scores.bestDeal
        };
        
        const sortFunction = sortFunctions[this.sortBy] || sortFunctions['best-deal'];
        this.filteredTrips.sort(sortFunction);
        
        console.log(`Sorted by: ${this.sortOptions[this.sortBy]?.name || this.sortBy}`);
    }
    
    displayTrips() {
        const resultsContainer = document.getElementById('tripResults');
        if (!resultsContainer) return;
        
        if (this.filteredTrips.length === 0) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-bus" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                    <h3 style="color: #64748b; margin-bottom: 8px;">لا توجد رحلات متاحة</h3>
                    <p style="color: #94a3b8;">جرب تغيير معايير البحث أو التاريخ</p>
                </div>
            `;
            return;
        }
        
        const tripsHTML = this.filteredTrips.map(trip => `
            <div class="simple-trip-card" data-trip-id="${trip.id}" style="padding: 18px 18px 14px 18px; border-radius: 14px; border: 1px solid #e5e7eb; background: #fff; margin-bottom: 18px; box-shadow: 0 2px 8px #0001;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px; background: ${trip.companyColor}15; padding: 4px 6px; border-radius: 6px; border: 1px solid ${trip.companyColor}30;">${trip.companyLogo}</span>
                        <span style="font-weight: 600; color: #1e293b; font-size: 15px;">${trip.company}</span>
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #1e40af;">
                        ${trip.price} ج.م
                        ${trip.hasDiscount ? `<span style='color:#dc2626; font-size:12px; font-weight:600; margin-right:8px;'>خصم ${trip.discountPercent}%</span>` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: #1e293b;">${trip.departureTime}</div>
                        <div style="font-size: 12px; color: #64748b;">${window.searchManager ? window.searchManager.getCityName(trip.fromCity) : trip.fromCity}</div>
                    </div>
                    <div style="flex: 1; margin: 0 10px; position: relative;">
                        <div style="height: 2px; background: #e2e8f0; border-radius: 1px;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 2px 8px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 6px;">
                            <span>${trip.duration}</span>
                            <span style="color: #d1d5db;">•</span>
                            <span>
                                ${trip.numberOfStops === 0 ? 'مباشر' : `${trip.numberOfStops} محطة`}
                            </span>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: #1e293b;">${trip.arrivalTime}</div>
                        <div style="font-size: 12px; color: #64748b;">${window.searchManager ? window.searchManager.getCityName(trip.toCity) : trip.toCity}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0; gap: 10px;">
                    <div style="color: #10b981; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-chair" style="font-size: 13px;"></i>
                        <span>${trip.availableSeats} مقعد متاح</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button class="btn" style="border: 1px solid #e2e8f0; background: white; color: #475569; font-size:13px; padding: 6px 16px; border-radius: 6px;" onclick="viewTripDetails('${trip.id}')">
                            التفاصيل
                        </button>
                        <button class="btn" style="background: #1e40af; color: white; border: none; font-size:13px; padding: 6px 16px; border-radius: 6px;" onclick="selectTrip('${trip.id}')">
                            احجز
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = tripsHTML;
        
        console.log(`Displayed ${this.filteredTrips.length} trips for route: ${this.getCityName(this.searchParams.from)} → ${this.getCityName(this.searchParams.to)}`);
    }
    
    updateResultsCount() {
        const resultsCountElement = document.getElementById('resultsCount');
        if (resultsCountElement) {
            resultsCountElement.textContent = `${this.filteredTrips.length} نتيجة`;
        }
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Date navigation buttons - more specific targeting
        const prevButton = document.querySelector('.compact-date-nav[data-direction="prev"]');
        const nextButton = document.querySelector('.compact-date-nav[data-direction="next"]');
        
        console.log('Found prev button:', prevButton);
        console.log('Found next button:', nextButton);
        
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Prev button clicked, this:', this);
                console.log('this.navigateDate:', this.navigateDate);
                if (this.navigateDate) {
                    this.navigateDate('prev');
                } else {
                    console.error('navigateDate method not found!');
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked, this:', this);
                console.log('this.navigateDate:', this.navigateDate);
                if (this.navigateDate) {
                    this.navigateDate('next');
                } else {
                    console.error('navigateDate method not found!');
                }
            });
        }
        
        // Also use event delegation as backup
        document.addEventListener('click', (e) => {
            if (e.target.matches('.compact-date-nav') || e.target.closest('.compact-date-nav')) {
                const button = e.target.matches('.compact-date-nav') ? e.target : e.target.closest('.compact-date-nav');
                const direction = button.getAttribute('data-direction');
                console.log('Event delegation triggered, direction:', direction);
                if (direction) {
                    e.preventDefault();
                    this.navigateDate(direction);
                }
            }
        });
        
        // Modify search button
        const modifyBtn = document.querySelector('.compact-modify-btn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // Sort option pills - direct click with better event handling
        document.addEventListener('click', (e) => {
            const pill = e.target.closest('.sort-option-pill');
            if (pill) {
                e.preventDefault();
                e.stopPropagation();
                const sortType = pill.getAttribute('data-sort');
                console.log('Sort pill clicked:', sortType);
                if (sortType) {
                    this.setSortBy(sortType);
                }
            }
        });
        
        // Setup scroll indicators for sort options
        this.setupScrollIndicators();
        
        // Modal background click to close (if modal still exists)
        const sortModal = document.getElementById('sortModal');
        if (sortModal) {
            sortModal.addEventListener('click', (e) => {
                if (e.target === sortModal) {
                    this.hideSortModal();
                }
            });
        }
    }
    
    setupScrollIndicators() {
        const scrollContainer = document.querySelector('.sort-options-scroll');
        const container = document.querySelector('.sort-options-container');
        
        if (!scrollContainer || !container) return;
        
        const updateScrollIndicators = () => {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
            
            // Check if content is scrollable
            if (scrollWidth > clientWidth) {
                container.classList.add('scrollable');
            } else {
                container.classList.remove('scrollable');
            }
            
            // Check if scrolled from start
            if (scrollLeft > 5) {
                container.classList.add('scrolled');
            } else {
                container.classList.remove('scrolled');
            }
        };
        
        // Initial check
        updateScrollIndicators();
        
        // Update on scroll
        scrollContainer.addEventListener('scroll', updateScrollIndicators);
        
        // Update on resize
        window.addEventListener('resize', updateScrollIndicators);
    }
    
    navigateDate(direction) {
        const currentDate = new Date(this.currentDate || new Date());
        if (direction === 'next') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        this.currentDate = currentDate;
        this.updateDateDisplay();
        this.generateTrips();
        this.displayTrips();
    }
    
    // Set sort type and update display
    setSortBy(sortType) {
        this.sortBy = sortType;
        this.applySorting();
        this.displayTrips();
        
        // Update pills state
        this.updateSortPillsState();
    }
    
    // Show sort modal
    showSortModal() {
        const modal = document.getElementById('sortModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Hide sort modal
    hideSortModal() {
        const modal = document.getElementById('sortModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Global functions for backward compatibility
function navigateDate(direction) {
    if (window.searchManager) {
        window.searchManager.navigateDate(direction);
    }
}

function selectTrip(tripId) {
    // Store selected trip data
    const trip = window.searchManager.filteredTrips.find(t => t.id === tripId);
    if (trip) {
        localStorage.setItem('selectedTrip', JSON.stringify(trip));
    }
    window.location.href = `seat-selection.html?trip=${tripId}`;
}

function viewTripDetails(tripId) {
    const trip = window.searchManager.filteredTrips.find(t => t.id === tripId);
    if (!trip) return;
    const modal = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    // توليد محطات توقف وهمية مع توقيت تقريبي
    let stops = [];
    if (trip.numberOfStops > 0) {
        // حساب الفاصل الزمني بين كل محطة
        const depHour = parseInt(trip.departureTime.split(":")[0]);
        const depMin = parseInt(trip.departureTime.split(":")[1]);
        const totalMinutes = trip.durationHours * 60;
        const interval = Math.floor(totalMinutes / (trip.numberOfStops + 1));
        let currentMinutes = depHour * 60 + depMin;
        for (let i = 1; i <= trip.numberOfStops; i++) {
            currentMinutes += interval;
            let h = Math.floor(currentMinutes / 60);
            let m = currentMinutes % 60;
            if (h > 23) h = h % 24;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            stops.push({ name: `محطة توقف ${i}`, time: timeStr });
        }
    }
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #1e293b; margin-bottom: 12px;">${trip.company}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 0;">
                    <div><strong>نوع الحافلة:</strong> ${trip.busType}</div>
                    <div><strong>التقييم:</strong> ${trip.rating} ⭐</div>
                    <div><strong>المقاعد المتاحة:</strong> ${trip.availableSeats}</div>
                    <div><strong>مدة الرحلة:</strong> ${trip.duration}</div>
                    <div><strong> سعر التذكرة:</strong> <span style="color:#10b981; font-weight:bold;">${trip.price}</span> ج.م</div>
                </div>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${trip.departureTime}</div>
                            <div style="color: #64748b;">${window.searchManager ? window.searchManager.getCityName(trip.fromCity) : trip.fromCity}</div>
                        </div>
                        <div style="text-align: center; color: #64748b;">
                            <i class="fas fa-arrow-left"></i>
                            <div style="font-size: 12px;">${trip.duration}</div>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${trip.arrivalTime}</div>
                            <div style="color: #64748b;">${window.searchManager ? window.searchManager.getCityName(trip.toCity) : trip.toCity}</div>
                        </div>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px; color: #334155;">
                        <div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 6px; gap: 12px; flex-wrap: wrap;">
                            <strong>خط سير الرحلة:</strong>
                            <span style="color:#1e40af; font-size:13px; background:#f1f5f9; border-radius:6px; padding:2px 10px; font-weight:600; display:inline-flex; align-items:center;">
                                <i class="fas fa-clock" style="margin-left:4px;"></i> زمن الرحلة: ${trip.duration}
                            </span>
                        </div>
                        <div style="margin: 16px 0 0 0; padding: 0 10px;">
                            <div style="position: relative; padding-right: 26px;">
                                <div style="position: absolute; right: 17px; top: 0; bottom: 0; width: 2px; background: #e5e7eb; border-radius: 1px;"></div>
                                <!-- نقطة البداية -->
                                <div style="display: flex; align-items: center; margin-bottom: 14px; position: relative; z-index:1;">
                                    <span style="position: absolute; right: 9px; width: 10px; height: 10px; background: #60a5fa; border-radius: 50%; border: 1.5px solid #fff;"></span>
                                    <span style="margin-right: 22px; font-weight: 500; color: #22292f; font-size: 13px;">${window.searchManager ? window.searchManager.getCityName(trip.fromCity) : trip.fromCity}</span>
                                    <span style="color:#94a3b8; font-size:12px; margin-right:8px;">${trip.departureTime}</span>
                                </div>
                                <!-- نقاط التوقف -->
                                ${stops.map((stop, idx) => `
                                    <div style="display: flex; align-items: center; margin-bottom: 14px; position: relative; z-index:1;">
                                        <span style="position: absolute; right: 11px; width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; border: 1.5px solid #fff;"></span>
                                        <span style="margin-right: 22px; color: #475569; font-size: 12.5px;">${stop.name}</span>
                                        <span style="color:#b0b6be; font-size:11.5px; margin-right:8px;">${stop.time}</span>
                                    </div>
                                `).join('')}
                                <!-- نقطة النهاية -->
                                <div style="display: flex; align-items: center; margin-bottom: 0; position: relative; z-index:1;">
                                    <span style="position: absolute; right: 9px; width: 10px; height: 10px; background: #6366f1; border-radius: 50%; border: 1.5px solid #fff;"></span>
                                    <span style="margin-right: 22px; font-weight: 500; color: #22292f; font-size: 13px;">${window.searchManager ? window.searchManager.getCityName(trip.toCity) : trip.toCity}</span>
                                    <span style="color:#94a3b8; font-size:12px; margin-right:8px;">${trip.arrivalTime}</span>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:10px">
                            <strong>عدد المحطات:</strong> ${trip.numberOfStops === 0 ? 'مباشر (بدون توقف)' : trip.numberOfStops + ' توقف'}
                        </div>
                    </div>
                </div>
                ${trip.amenities.length > 0 ? `
                <div>
                    <strong style="display: block; margin-bottom: 8px;">الخدمات المتاحة:</strong>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${trip.amenities.map(amenity => {
                            const amenityIcons = {
                                wifi: { icon: 'fa-wifi', name: 'واي فاي' },
                                ac: { icon: 'fa-snowflake', name: 'تكييف' },
                                meal: { icon: 'fa-utensils', name: 'وجبة' },
                                charging: { icon: 'fa-plug', name: 'شاحن' },
                                entertainment: { icon: 'fa-tv', name: 'ترفيه' }
                            };
                            const info = amenityIcons[amenity] || { icon: 'fa-check', name: amenity };
                            return `<span style=\"background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 4px;\">
                                <i class=\"fas ${info.icon}\"></i>
                                <span>${info.name}</span>
                            </span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                <div style="margin-top: 18px; background: #f1f5f9; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #334155;">
                    <strong>سياسة الأمتعة:</strong> حقيبة واحدة (حتى 20 كجم) + حقيبة يد صغيرة لكل راكب.<br>
                    <strong>تعليمات الحضور:</strong> يرجى الحضور إلى محطة الانطلاق قبل موعد الرحلة بـ 30 دقيقة على الأقل.<br>
                    <strong>سياسة الإلغاء:</strong> يمكنك الإلغاء حتى 24 ساعة قبل موعد الرحلة مع استرداد كامل المبلغ.<br>
                    <strong>ملاحظة:</strong> يرجى الاحتفاظ بتذكرة الحجز وبطاقة الهوية عند الصعود للحافلة.
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <button onclick="closeModal()" style="background: #f8fafc; color: #64748b; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                    إغلاق
                </button>
                <button onclick="selectTrip('${trip.id}')" style="background: #1e40af; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                    احجز
                </button>
            </div>
        `;
        modal.style.display = 'block';
    }
}

// Global helper functions for trip actions
function selectTrip(tripId) {
    if (window.searchManager) {
        const trip = window.searchManager.filteredTrips.find(t => t.id === tripId);
        if (trip) {
            localStorage.setItem('selectedTrip', JSON.stringify(trip));
            window.location.href = `seat-selection.html?trip=${tripId}`;
        }
    }
}

function closeModal() {
    const modal = document.getElementById('tripModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchResultsManager();
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('tripModal');
        if (event.target === modal) {
            closeModal();
        }
    });
});
