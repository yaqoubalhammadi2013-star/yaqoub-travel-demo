const STORAGE_KEY = 'yaqoub-travel-saved-trips';
const DESTINATIONS = [
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    city: 'London',
    airports: [
      { code: 'LHR', name: 'London Heathrow Airport' },
      { code: 'LGW', name: 'London Gatwick Airport' },
      { code: 'STN', name: 'London Stansted Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'France',
    flag: '🇫🇷',
    city: 'Paris',
    airports: [
      { code: 'CDG', name: 'Charles de Gaulle Airport' },
      { code: 'ORY', name: 'Paris Orly Airport' },
      { code: 'BVA', name: 'Paris Beauvais Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'Turkey',
    flag: '🇹🇷',
    city: 'Istanbul',
    airports: [
      { code: 'IST', name: 'Istanbul Airport' },
      { code: 'SAW', name: 'Sabiha Gökçen Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    airports: [
      { code: 'HND', name: 'Haneda Airport' },
      { code: 'NRT', name: 'Narita Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    city: 'New York',
    airports: [
      { code: 'JFK', name: 'John F. Kennedy International Airport' },
      { code: 'EWR', name: 'Newark Liberty International Airport' },
      { code: 'LGA', name: 'LaGuardia Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'Thailand',
    flag: '🇹🇭',
    city: 'Bangkok',
    airports: [
      { code: 'BKK', name: 'Suvarnabhumi Airport' },
      { code: 'DMK', name: 'Don Mueang Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579a4a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    city: 'Rome',
    airports: [
      { code: 'FCO', name: 'Rome Fiumicino Airport' },
      { code: 'CIA', name: 'Ciampino Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80'
  },
  {
    country: 'Singapore',
    flag: '🇸🇬',
    city: 'Singapore',
    airports: [
      { code: 'SIN', name: 'Changi Airport' }
    ],
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80'
  }
];

const DEFAULT_AIRPORTS = ['AUH', 'DXB'];

const state = {
  results: [],
  filters: { sort: 'cheapest', airline: 'all', departureWindow: 'all', maxPrice: 5000 },
  savedTrips: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  preferredAirports: []
};

const form = document.getElementById('flightSearchForm');
const countryInput = document.getElementById('countryInput');
const cityInput = document.getElementById('cityInput');
const departureDate = document.getElementById('departureDate');
const returnDate = document.getElementById('returnDate');
const adults = document.getElementById('adults');
const children = document.getElementById('children');
const cabinClass = document.getElementById('cabinClass');
const tripType = document.getElementById('tripType');
const airportOptions = document.getElementById('airportOptions');
const compareGrid = document.getElementById('compareGrid');
const flightResults = document.getElementById('flightResults');
const airlineFilter = document.getElementById('airlineFilter');
const departureFilter = document.getElementById('departureFilter');
const priceLimit = document.getElementById('priceLimit');
const priceLimitText = document.getElementById('priceLimitText');
const apiStatusChip = document.getElementById('apiStatusChip');
const savedTripsList = document.getElementById('savedTripsList');
const tripCounter = document.getElementById('tripCounter');
const trackerStatus = document.getElementById('trackerStatus');
const refreshLivePricesBtn = document.getElementById('refreshLivePricesBtn');
const targetPriceInput = document.getElementById('targetPriceInput');
const saveSearchBtn = document.getElementById('saveSearchBtn');
const exportTripsBtn = document.getElementById('exportTripsBtn');
const lastCheckedStamp = document.getElementById('lastCheckedStamp');
const auhSummary = document.getElementById('auhSummary');
const dxbSummary = document.getElementById('dxbSummary');

const countryList = document.getElementById('countryList');
const cityList = document.getElementById('cityList');

function getCountryOptions() {
  return [...new Set(DESTINATIONS.map((destination) => destination.country))].sort();
}

function getCitiesForCountry(countryName) {
  return DESTINATIONS.filter((destination) => destination.country === countryName).map((destination) => destination.city);
}

function populateCountryAndCityLists() {
  const countries = getCountryOptions();
  countryList.innerHTML = countries
    .map((country) => `<option value="${country}"></option>`)
    .join('');

  const allCities = DESTINATIONS.map((destination) => destination.city).sort();
  cityList.innerHTML = allCities.map((city) => `<option value="${city}"></option>`).join('');
}

function ensureTodayDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const formatDate = (date) => date.toISOString().split('T')[0];

  departureDate.value = formatDate(tomorrow);
  returnDate.value = formatDate(nextWeek);
}

function updateAirportOptions() {
  const country = countryInput.value.trim();
  const city = cityInput.value.trim();
  const selectedDestination = DESTINATIONS.find(
    (item) => item.country === country && item.city === city
  );

  const airportList = selectedDestination?.airports || [];

  if (!airportList.length) {
    airportOptions.innerHTML = '<span class="airport-empty">Choose a destination to view available airports.</span>';
    state.preferredAirports = [];
    return;
  }

  const buttons = airportList
    .map(
      (airport) => `
        <label class="airport-option">
          <input type="checkbox" value="${airport.code}" ${state.preferredAirports.includes(airport.code) ? 'checked' : ''} />
          <span>${airport.code} • ${airport.name}</span>
        </label>
      `
    )
    .join('');

  airportOptions.innerHTML = buttons;

  airportOptions.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const selectedCodes = [...airportOptions.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
      state.preferredAirports = selectedCodes;
    });
  });
}

function getDestinationByInput() {
  const country = countryInput.value.trim();
  const city = cityInput.value.trim();

  return DESTINATIONS.find((destination) => destination.country === country && destination.city === city) || null;
}

function renderSavedTrips() {
  if (!state.savedTrips.length) {
    savedTripsList.innerHTML = '<div class="empty-trips">No saved trips yet. Save a search to track it later.</div>';
    tripCounter.textContent = '0 saved';
    return;
  }

  savedTripsList.innerHTML = state.savedTrips
    .map(
      (trip) => `
        <article class="saved-trip-card">
          <div class="saved-trip-header">
            <div>
              <span class="pill-country">${trip.country}</span>
              <h3>${trip.city}</h3>
            </div>
            <button class="mini-btn danger" data-delete="${trip.id}" type="button">Delete</button>
          </div>

          <div class="saved-meta">
            <span>${trip.departureDate} → ${trip.returnDate}</span>
            <span>${trip.adults + trip.children} travellers</span>
            <span>${trip.cabin}</span>
          </div>

          <div class="saved-actions">
            <button class="mini-btn" data-open="${trip.id}" type="button">Reopen</button>
            <small>Target: ${trip.targetPrice ? `AED ${trip.targetPrice.toLocaleString()}` : 'Not set'}</small>
          </div>
        </article>
      `
    )
    .join('');

  tripCounter.textContent = `${state.savedTrips.length} saved`;

  savedTripsList.querySelectorAll('[data-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const trip = state.savedTrips.find((item) => item.id === button.dataset.open);
      if (!trip) return;
      countryInput.value = trip.country;
      cityInput.value = trip.city;
      departureDate.value = trip.departureDate;
      returnDate.value = trip.returnDate;
      adults.value = trip.adults;
      children.value = trip.children;
      cabinClass.value = trip.cabin;
      tripType.value = trip.tripType;
      targetPriceInput.value = trip.targetPrice || '';
      updateAirportOptions();
    });
  });

  savedTripsList.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      state.savedTrips = state.savedTrips.filter((item) => item.id !== button.dataset.delete);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedTrips));
      renderSavedTrips();
    });
  });
}

function saveTripsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedTrips));
}

function formatCurrency(value, currency = 'AED') {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getDurationLabel(minutes) {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function getDepartureWindowLabel(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

function applyFilters(items) {
  let filtered = [...items];

  if (state.filters.airline !== 'all') {
    filtered = filtered.filter((item) => item.airlineName === state.filters.airline);
  }

  if (state.filters.departureWindow !== 'all') {
    filtered = filtered.filter((item) => {
      const departureDateTime = item.departureTime ? new Date(item.departureTime) : null;
      if (!departureDateTime) return false;
      return getDepartureWindowLabel(departureDateTime.getHours()) === state.filters.departureWindow;
    });
  }

  if (state.filters.maxPrice) {
    filtered = filtered.filter((item) => Number(item.price) <= Number(state.filters.maxPrice));
  }

  if (state.filters.sort === 'fastest') {
    filtered.sort((a, b) => Number(a.durationMinutes) - Number(b.durationMinutes));
  } else if (state.filters.sort === 'nonstop') {
    filtered.sort((a, b) => Number(a.stops) - Number(b.stops) || Number(a.price) - Number(b.price));
  } else {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (state.filters.sort === 'nonstop') {
    filtered = filtered.filter((item) => Number(item.stops) === 0);
  }

  return filtered;
}

function renderCompareCards() {
  const originSummaries = {
    AUH: state.results.filter((item) => item.sourceAirport === 'AUH'),
    DXB: state.results.filter((item) => item.sourceAirport === 'DXB')
  };

  const compareCardData = DEFAULT_AIRPORTS.map((airportCode) => {
    const flights = originSummaries[airportCode] || [];
    const cheapest = flights.length ? flights.reduce((prev, current) => (Number(current.price) < Number(prev.price) ? current : prev), flights[0]) : null;
    return {
      airportCode,
      cheapest
    };
  });

  compareGrid.innerHTML = compareCardData
    .map(({ airportCode, cheapest }) => {
      const priceText = cheapest ? formatCurrency(cheapest.price, cheapest.currency) : 'No live result';
      const airlineText = cheapest ? `${cheapest.airlineName}` : 'Unavailable';
      return `
        <article class="compare-card ${airportCode === 'AUH' ? 'active-compare' : ''}">
          <div class="compare-header">
            <span class="compare-code">${airportCode}</span>
            <span class="compare-badge">${cheapest ? 'Lowest fare' : 'No data'}</span>
          </div>
          <h3>${priceText}</h3>
          <p>${airlineText}</p>
        </article>
      `;
    })
    .join('');

  const cheapestAirport = compareCardData
    .filter((card) => card.cheapest)
    .sort((a, b) => Number(a.cheapest.price) - Number(b.cheapest.price))[0];

  if (cheapestAirport) {
    auhSummary.textContent = compareCardData[0].cheapest ? formatCurrency(compareCardData[0].cheapest.price, compareCardData[0].cheapest.currency) : 'No live result';
    dxbSummary.textContent = compareCardData[1].cheapest ? formatCurrency(compareCardData[1].cheapest.price, compareCardData[1].cheapest.currency) : 'No live result';

    if (cheapestAirport.airportCode === 'AUH') {
      auhSummary.parentElement.style.color = '#46d39a';
      dxbSummary.parentElement.style.color = '#d7dee8';
    } else {
      dxbSummary.parentElement.style.color = '#46d39a';
      auhSummary.parentElement.style.color = '#d7dee8';
    }
  } else {
    auhSummary.textContent = 'No live result';
    dxbSummary.textContent = 'No live result';
    auhSummary.parentElement.style.color = '#d7dee8';
    dxbSummary.parentElement.style.color = '#d7dee8';
  }
}

function renderFlightCards() {
  const filteredResults = applyFilters(state.results);

  if (!filteredResults.length) {
    flightResults.innerHTML = `
      <div class="empty-results">
        <h3>No live flight results yet.</h3>
        <p>Try another destination or refresh the price search.</p>
      </div>
    `;
    return;
  }

  const airlineNames = [...new Set(filteredResults.map((item) => item.airlineName))].sort();
  airlineFilter.innerHTML = ['<option value="all">All airlines</option>']
    .concat(airlineNames.map((name) => `<option value="${name}">${name}</option>`))
    .join('');
  airlineFilter.value = state.filters.airline;

  flightResults.innerHTML = filteredResults
    .map((flight) => {
      const departure = flight.departureTime ? new Date(flight.departureTime) : null;
      const arrival = flight.arrivalTime ? new Date(flight.arrivalTime) : null;
      const departureLabel = departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      const arrivalLabel = arrival ? arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      const flightLabel = flight.flightNumber || 'Flight unavailable';
      const baggageLabel = flight.baggage || 'Baggage not listed';
      const bookingLink = flight.bookingLink ? `<a href="${flight.bookingLink}" target="_blank" rel="noreferrer" class="booking-link">Book now</a>` : '<span class="booking-link disabled">Booking link unavailable</span>';

      return `
        <article class="flight-card">
          <div class="flight-header">
            <div class="airline-box">
              <div class="airline-logo">${flight.airlineCode ? flight.airlineCode.slice(0, 2) : 'FL'}</div>
              <div>
                <h3>${flight.airlineName || 'Airline'}</h3>
                <p>${flightLabel}</p>
              </div>
            </div>
            <div class="price-box-large">
              <span>From</span>
              <strong>${formatCurrency(flight.price, flight.currency)}</strong>
            </div>
          </div>

          <div class="flight-route">
            <div>
              <small>Departure</small>
              <strong>${flight.originAirport}</strong>
              <span>${departureLabel}</span>
            </div>
            <div class="route-arrow">→</div>
            <div>
              <small>Arrival</small>
              <strong>${flight.destinationAirport}</strong>
              <span>${arrivalLabel}</span>
            </div>
          </div>

          <div class="flight-meta">
            <span><strong>${getDurationLabel(flight.durationMinutes)}</strong> duration</span>
            <span><strong>${flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</strong></span>
            <span><strong>${baggageLabel}</strong></span>
            <span><strong>${flight.sourceAirport}</strong> hub</span>
          </div>

          <div class="flight-footer">
            <small>Live check from secure backend</small>
            ${bookingLink}
          </div>
        </article>
      `;
    })
    .join('');
}

async function searchFlights() {
  const destination = getDestinationByInput();

  if (!destination) {
    alert('Please choose a valid country and city from the available destinations.');
    return;
  }

  const adultCount = Number(adults.value) || 1;
  const childCount = Number(children.value) || 0;
  const selectedCountry = countryInput.value.trim();
  const selectedCity = cityInput.value.trim();
  const selectedDeparture = departureDate.value;
  const selectedReturn = returnDate.value;

  if (!selectedDeparture || !selectedCountry || !selectedCity) {
    alert('Please complete the destination and date fields before searching.');
    return;
  }

  if (selectedReturn && selectedReturn < selectedDeparture) {
    alert('Return date must be on or after the departure date.');
    return;
  }

  const params = new URLSearchParams({
    country: selectedCountry,
    city: selectedCity,
    departureDate: selectedDeparture,
    returnDate: selectedReturn || selectedDeparture,
    adults: String(adultCount),
    children: String(childCount),
    cabin: cabinClass.value,
    tripType: tripType.value,
    preferredAirports: state.preferredAirports.join(',')
  });

  try {
    apiStatusChip.textContent = 'API status: loading…';
    apiStatusChip.classList.add('loading');

    const response = await fetch(`/api/search?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Live flight search failed.');
    }

    state.results = Array.isArray(data.results) ? data.results : [];
    renderCompareCards();
    renderFlightCards();
    lastCheckedStamp.textContent = new Date(data.lastChecked).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    apiStatusChip.textContent = 'API status: live';
    apiStatusChip.classList.remove('loading');
    apiStatusChip.classList.add('success');

    const targetPriceValue = Number(targetPriceInput.value);
    if (Number.isFinite(targetPriceValue) && targetPriceValue > 0) {
      const bestPrice = state.results.reduce((min, item) => Math.min(min, Number(item.price) || Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
      trackerStatus.textContent = bestPrice <= targetPriceValue
        ? `Target reached: best live fare is ${formatCurrency(bestPrice)}.`
        : `Target not reached yet. Best live fare is ${formatCurrency(bestPrice)}.`;
    }
  } catch (error) {
    state.results = [];
    renderCompareCards();
    renderFlightCards();
    apiStatusChip.textContent = 'API status: unavailable';
    apiStatusChip.classList.remove('loading');
    apiStatusChip.classList.add('error');
    trackerStatus.textContent = error.message || 'The live API is unavailable. Please check your backend configuration.';
    lastCheckedStamp.textContent = 'No successful check';
  }
}

function handleSavedTrip() {
  const destination = getDestinationByInput();
  if (!destination) {
    alert('Select a valid country and city before saving a trip.');
    return;
  }

  const payload = {
    id: crypto.randomUUID(),
    country: countryInput.value.trim(),
    city: cityInput.value.trim(),
    departureDate: departureDate.value,
    returnDate: returnDate.value,
    adults: Number(adults.value) || 1,
    children: Number(children.value) || 0,
    cabin: cabinClass.value,
    tripType: tripType.value,
    targetPrice: Number(targetPriceInput.value) || null
  };

  state.savedTrips.unshift(payload);
  saveTripsToStorage();
  renderSavedTrips();
  trackerStatus.textContent = `Saved trip to ${payload.city}.`;
}

function exportTrips() {
  if (!state.savedTrips.length) {
    alert('There are no saved trips to export.');
    return;
  }

  const blob = new Blob([JSON.stringify(state.savedTrips, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'yaqoub-travel-trips.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function bindEvents() {
  countryInput.addEventListener('change', () => {
    const country = countryInput.value.trim();
    const cities = getCitiesForCountry(country);
    if (cities.length) {
      cityInput.value = cities[0];
      updateAirportOptions();
    }
  });

  cityInput.addEventListener('change', () => {
    updateAirportOptions();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchFlights();
  });

  refreshLivePricesBtn.addEventListener('click', searchFlights);

  saveSearchBtn.addEventListener('click', handleSavedTrip);
  exportTripsBtn.addEventListener('click', exportTrips);

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.filters.sort = button.dataset.filter;
      renderFlightCards();
    });
  });

  airlineFilter.addEventListener('change', (event) => {
    state.filters.airline = event.target.value;
    renderFlightCards();
  });

  departureFilter.addEventListener('change', (event) => {
    state.filters.departureWindow = event.target.value;
    renderFlightCards();
  });

  priceLimit.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    state.filters.maxPrice = value;
    priceLimitText.textContent = `Up to AED ${value.toLocaleString()}`;
    renderFlightCards();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

function init() {
  populateCountryAndCityLists();
  ensureTodayDates();
  bindEvents();
  updateAirportOptions();
  renderSavedTrips();
  renderCompareCards();
  renderFlightCards();
  priceLimitText.textContent = `Up to AED ${priceLimit.value.toLocaleString()}`;
  lastCheckedStamp.textContent = 'Not yet';
  apiStatusChip.textContent = 'API status: idle';
}

init();
