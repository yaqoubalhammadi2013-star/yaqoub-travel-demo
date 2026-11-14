const $ = (selector) => document.querySelector(selector);
const flightTab = $('#flightTab');
const hotelTab = $('#hotelTab');
const flightPanel = $('#flightPanel');
const hotelPanel = $('#hotelPanel');
const searchMessage = $('#searchMessage');
const today = new Date();
const localDate = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};
const todayString = localDate(today);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 8);

function setDateDefaults() {
  ['departDate', 'checkin'].forEach(id => {
    const input = document.getElementById(id);
    input.min = todayString;
    if (!input.value) input.value = localDate(tomorrow);
  });
  ['returnDate', 'checkout'].forEach(id => {
    const input = document.getElementById(id);
    input.min = todayString;
    if (!input.value) input.value = localDate(nextWeek);
  });
}

function selectTab(tab) {
  const flights = tab === 'flights';
  flightTab.classList.toggle('active', flights);
  hotelTab.classList.toggle('active', !flights);
  flightTab.setAttribute('aria-selected', String(flights));
  hotelTab.setAttribute('aria-selected', String(!flights));
  flightPanel.hidden = !flights;
  hotelPanel.hidden = flights;
  searchMessage.hidden = true;
}
flightTab.addEventListener('click', () => selectTab('flights'));
hotelTab.addEventListener('click', () => selectTab('hotels'));

$('input[name="tripType"][value="roundtrip"]').addEventListener('change', (event) => {
  const returnField = $('.return-field');
  const returnDate = $('#returnDate');
  const isReturn = event.target.checked;
  returnField.hidden = !isReturn;
  returnDate.required = isReturn;
});

function showMessage(message, links = []) {
  searchMessage.replaceChildren();
  const text = document.createElement('p');
  text.textContent = message;
  searchMessage.append(text);
  if (links.length) {
    const list = document.createElement('div');
    list.className = 'provider-links';
    links.forEach(({ label, href }) => {
      const link = document.createElement('a');
      link.className = 'button button-navy';
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      list.append(link);
    });
    searchMessage.append(list);
  }
  searchMessage.hidden = false;
  searchMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function googleFlightsUrl(origin, destination, depart, returnDate, cabin, travellers, oneWay) {
  const query = new URLSearchParams({ q: `Flights from ${origin} to ${destination} on ${depart}${oneWay ? '' : ` returning ${returnDate}`}, ${travellers} travellers, ${cabin}` });
  return `https://www.google.com/travel/flights?${query.toString()}`;
}

$('#flightForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const origin = $('#origin').value;
  const destination = $('#flightDestination').value.trim();
  const depart = $('#departDate').value;
  const returnDate = $('#returnDate').value;
  const oneWay = $('input[name="tripType"]:checked').value === 'oneway';
  if (!destination) return showMessage('Enter a destination city, country or airport to search.');
  if (depart < todayString) return showMessage('Choose a departure date that is today or later.');
  if (!oneWay && returnDate < depart) return showMessage('Your return date must be on or after your departure date.');
  const links = [{ label: `Search from ${origin} on Google Flights ↗`, href: googleFlightsUrl(origin, destination, depart, returnDate, $('#cabin').value, $('#travellers').value, oneWay) }];
  if (origin === 'AUH') links.push({ label: 'Compare from Dubai (DXB) ↗', href: googleFlightsUrl('Dubai DXB', destination, depart, returnDate, $('#cabin').value, $('#travellers').value, oneWay) });
  else links.push({ label: 'Compare from Abu Dhabi (AUH) ↗', href: googleFlightsUrl('Abu Dhabi AUH', destination, depart, returnDate, $('#cabin').value, $('#travellers').value, oneWay) });
  showMessage('Live airline availability and fares are not connected to YAQOUB TRAVEL yet. Continue to Google Flights to see current results from the provider. Prices, schedules, baggage and booking terms are confirmed there.', links);
});

$('#hotelForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const destination = $('#hotelDestination').value.trim();
  const checkin = $('#checkin').value;
  const checkout = $('#checkout').value;
  if (!destination) return showMessage('Enter a destination to search for stays.');
  if (checkin < todayString) return showMessage('Choose a check-in date that is today or later.');
  if (checkout <= checkin) return showMessage('Check-out must be after check-in.');
  const params = new URLSearchParams({ ss: destination, checkin, checkout, group_adults: $('#hotelGuests').value.startsWith('2') ? '2' : '1', no_rooms: $('#rooms').value.split(' ')[0], selected_currency: 'AED' });
  showMessage('Live hotel availability, property photos, ratings and prices are not connected to YAQOUB TRAVEL. Continue to Booking.com for current listings and provider-supplied details.', [{ label: 'Search stays on Booking.com ↗', href: `https://www.booking.com/searchresults.html?${params.toString()}` }]);
});

$('#hotelExplore').addEventListener('click', () => {
  selectTab('hotels');
  $('#hotelDestination').focus({ preventScroll: true });
  $('.booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mainNav.classList.toggle('open', open);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));

document.querySelectorAll('.faq-list details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    const indicator = detail.querySelector('summary span');
    if (indicator) indicator.textContent = detail.open ? '−' : '+';
  });
});
$('#year').textContent = new Date().getFullYear();
setDateDefaults();
