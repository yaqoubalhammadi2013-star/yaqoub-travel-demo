const STORAGE_KEY = 'yaqoub-travel-demo-trips';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

const IMAGE_MAP = {
  Paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  London: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  Rome: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80',
  Tokyo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-fa657effe883?auto=format&fit=crop&w=1200&q=80',
  Istanbul: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80',
  Bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579a4a?auto=format&fit=crop&w=1200&q=80'
};

const tripForm = document.getElementById('tripForm');
const tripList = document.getElementById('tripList');
const tripCount = document.getElementById('tripCount');
const refreshAllBtn = document.getElementById('refreshAllBtn');
const lastRefreshLabel = document.getElementById('lastRefreshLabel');
const tripCardTemplate = document.getElementById('tripCardTemplate');

function getTrips() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const starterTrips = [
      {
        id: crypto.randomUUID(),
        destinationCity: 'Paris',
        destinationCountry: 'France',
        departureDate: '2026-12-20',
        returnDate: '2026-12-28',
        adults: 2,
        cabin: 'ECONOMY',
        createdAt: new Date().toISOString(),
        lastChecked: null,
        origins: ['AUH', 'DXB'],
        priceStatus: 'demo'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTrips));
    return starterTrips;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function createTripCard(trip) {
  const node = tripCardTemplate.content.firstElementChild.cloneNode(true);
  const city = trip.destinationCity;
  const image = IMAGE_MAP[city] || PLACEHOLDER_IMAGE;

  node.querySelector('.trip-image').style.backgroundImage = `linear-gradient(rgba(18, 27, 46, 0.08), rgba(18, 27, 46, 0.08)), url('${image}')`;
  node.querySelector('.trip-country').textContent = trip.destinationCountry;
  node.querySelector('.trip-city').textContent = city;
  node.querySelector('.meta-item:nth-child(1)').textContent = `${trip.departureDate} → ${trip.returnDate}`;
  node.querySelector('.meta-item:nth-child(2)').textContent = `${trip.adults} travellers`;
  node.querySelector('.meta-item:nth-child(3)').textContent = trip.cabin;

  const auh = node.querySelector('.origin-auh');
  const dxb = node.querySelector('.origin-dxb');
  const refreshOne = node.querySelector('.refresh-one');

  const status = trip.lastChecked ? `Checked ${new Date(trip.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting';
  node.querySelector('.last-refresh').textContent = `Last update: ${status}`;

  const originMap = trip.originStatus || {
    AUH: { value: 'Not verifiable', type: 'demo' },
    DXB: { value: 'Not verifiable', type: 'demo' }
  };

  auh.textContent = originMap.AUH?.value || 'Not verifiable';
  dxb.textContent = originMap.DXB?.value || 'Not verifiable';

  refreshOne.addEventListener('click', () => refreshTrip(trip.id));

  return node;
}

function renderTrips() {
  const trips = getTrips();
  tripList.innerHTML = '';

  if (!trips.length) {
    tripList.innerHTML = '<div class="empty-state">No trips saved yet. Add your first destination above.</div>';
    tripCount.textContent = '0 trips';
    return;
  }

  tripList.append(...trips.map(createTripCard));
  tripCount.textContent = `${trips.length} trip${trips.length === 1 ? '' : 's'}`;
}

function refreshTrip(tripId) {
  const trips = getTrips();
  const trip = trips.find(item => item.id === tripId);
  if (!trip) return;

  const now = new Date();
  const dateToday = now.toISOString().slice(0, 10);
  const tripDate = trip.returnDate;

  if (tripDate && dateToday > tripDate) {
    trip.originStatus = {
      AUH: { value: 'Monitoring stopped', type: 'stopped' },
      DXB: { value: 'Monitoring stopped', type: 'stopped' }
    };
    trip.lastChecked = now.toISOString();
    saveTrips(trips);
    renderTrips();
    return;
  }

  trip.originStatus = {
    AUH: { value: 'Demo: not verifiable', type: 'demo' },
    DXB: { value: 'Demo: not verifiable', type: 'demo' }
  };
  trip.lastChecked = now.toISOString();
  saveTrips(trips);
  renderTrips();

  lastRefreshLabel.textContent = now.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function refreshAllTrips() {
  const trips = getTrips();
  trips.forEach(trip => {
    const now = new Date();
    trip.lastChecked = now.toISOString();
    trip.originStatus = {
      AUH: { value: 'Demo: not verifiable', type: 'demo' },
      DXB: { value: 'Demo: not verifiable', type: 'demo' }
    };
  });
  saveTrips(trips);
  lastRefreshLabel.textContent = new Date().toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  renderTrips();
}

tripForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const destinationCity = document.getElementById('destinationCity').value.trim();
  const destinationCountry = document.getElementById('destinationCountry').value.trim();
  const departureDate = document.getElementById('departureDate').value;
  const returnDate = document.getElementById('returnDate').value;
  const adults = Number(document.getElementById('adults').value);
  const cabin = document.getElementById('cabin').value;

  if (!destinationCity || !destinationCountry || !departureDate || !returnDate || adults < 1) {
    alert('Please fill in all fields correctly.');
    return;
  }

  if (returnDate < departureDate) {
    alert('Return date must be on or after departure date.');
    return;
  }

  const trip = {
    id: crypto.randomUUID(),
    destinationCity,
    destinationCountry,
    departureDate,
    returnDate,
    adults,
    cabin,
    createdAt: new Date().toISOString(),
    lastChecked: null,
    origins: ['AUH', 'DXB'],
    originStatus: {
      AUH: { value: 'Not verifiable', type: 'demo' },
      DXB: { value: 'Not verifiable', type: 'demo' }
    }
  };

  const trips = getTrips();
  trips.unshift(trip);
  saveTrips(trips);
  tripForm.reset();
  document.getElementById('adults').value = '2';
  document.getElementById('cabin').value = 'ECONOMY';
  renderTrips();
});

refreshAllBtn.addEventListener('click', refreshAllTrips);

renderTrips();
lastRefreshLabel.textContent = 'Waiting';
