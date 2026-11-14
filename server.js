const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

const AIRPORT_NAME_LOOKUP = Object.fromEntries(
  DESTINATIONS.flatMap((destination) =>
    destination.airports.map((airport) => [airport.code, `${destination.city} • ${airport.name}`])
  )
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function normalizeCabin(cabin) {
  const map = {
    ECONOMY: 'ECONOMY',
    PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
    BUSINESS: 'BUSINESS',
    FIRST: 'FIRST',
    FIRST_CLASS: 'FIRST',
    PREMIUM: 'PREMIUM_ECONOMY'
  };

  return map[cabin] || 'ECONOMY';
}

function parsePrice(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toMinutes(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const mins = Number(match[2] || 0);
  return hours * 60 + mins;
}

function mapOfferToFlight(offer, originCode, destinationCode) {
  const itinerary = offer.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || {};
  const departureTime = firstSegment.departure?.at || null;
  const arrivalTime = lastSegment.arrival?.at || null;
  const price = offer.price || {};
  const priceTotal = parsePrice(price.total || 0);

  const travelerPricing = offer.travelerPricings?.[0] || {};
  const baggage = travelerPricing.fareDetailsBySegment?.[0]?.includedCheckedBags || null;

  const baggageText = baggage
    ? `${baggage.weight || ''}${baggage.weightUnit || ''} checked bag${(baggage.quantity || 1) > 1 ? 's' : ''}`
    : 'Baggage details available at booking';

  const airlineCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode || 'N/A';
  const flightNumber = `${airlineCode}-${firstSegment.number || '---'}`;

  return {
    id: `${offer.id || airlineCode}-${originCode}-${Date.now()}`,
    airlineCode,
    airlineName: airlineCode,
    flightNumber,
    originAirport: originCode,
    destinationAirport: destinationCode,
    departureAirport: firstSegment.departure?.iataCode || originCode,
    arrivalAirport: lastSegment.arrival?.iataCode || destinationCode,
    departureTime,
    arrivalTime,
    duration: itinerary?.duration || 'PT0H0M',
    durationMinutes: toMinutes(itinerary?.duration || 'PT0H0M'),
    stops: Math.max((segments.length || 1) - 1, 0),
    baggage: baggageText,
    price: priceTotal,
    currency: price.currency || 'AED',
    deepLink: offer.deepLink || null,
    sourceAirport: originCode,
    bookingLink: offer.deepLink || null,
    source: 'amadeus'
  };
}

async function getAmadeusToken() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are not configured.');
  }

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }).toString()
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Amadeus token request failed: ${response.status} ${body}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function searchAmadeusFlightOffers({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  returnDate,
  adults,
  children,
  travelClass,
  tripType,
  max = 8
}) {
  const token = await getAmadeusToken();

  const params = new URLSearchParams({
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults: String(adults || 1),
    max: String(max),
    currencyCode: 'AED',
    nonStop: 'false'
  });

  if (returnDate && tripType === 'round-trip') {
    params.set('returnDate', returnDate);
  }

  if (children && Number(children) > 0) {
    params.set('children', String(children));
  }

  if (travelClass) {
    params.set('travelClass', normalizeCabin(travelClass));
  }

  const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Amadeus flight search failed: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const offers = Array.isArray(payload.data) ? payload.data : [];

  return offers.map((offer) => mapOfferToFlight(offer, originLocationCode, destinationLocationCode));
}

app.get('/api/health', (req, res) => {
  const configured = Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

  res.json({
    ok: true,
    apiConfigured: configured,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/destinations', (req, res) => {
  res.json({ destinations: DESTINATIONS });
});

app.get('/api/search', async (req, res) => {
  const {
    country,
    city,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
    cabin = 'ECONOMY',
    tripType = 'round-trip',
    preferredAirports = ''
  } = req.query;

  if (!country || !city || !departureDate) {
    return res.status(400).json({
      ok: false,
      error: 'country, city, and departureDate are required.'
    });
  }

  const selectedDestination = DESTINATIONS.find(
    (destination) =>
      destination.city.toLowerCase() === String(city).trim().toLowerCase() &&
      destination.country.toLowerCase() === String(country).trim().toLowerCase()
  );

  if (!selectedDestination) {
    return res.status(404).json({
      ok: false,
      error: `No destination match found for ${city}, ${country}.`
    });
  }

  const destinationAirportCode = selectedDestination.airports[0]?.code || 'LHR';
  const selectedAirportCodes = String(preferredAirports || '')
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  const originCodes = ['AUH', 'DXB'];
  const allResults = [];

  const configured = Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

  if (!configured) {
    return res.status(503).json({
      ok: false,
      error: 'The live flight API is currently unavailable. Configure AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in your .env file to enable live prices.',
      lastChecked: new Date().toISOString(),
      results: []
    });
  }

  try {
    for (const originCode of originCodes) {
      const offerResults = await searchAmadeusFlightOffers({
        originLocationCode: originCode,
        destinationLocationCode: destinationAirportCode,
        departureDate,
        returnDate,
        adults: Number(adults),
        children: Number(children),
        travelClass: cabin,
        tripType,
        max: 8
      });

      allResults.push(
        ...offerResults.map((result) => ({
          ...result,
          preferredAirportMatch: selectedAirportCodes.length
            ? selectedAirportCodes.includes(result.arrivalAirport) || selectedAirportCodes.includes(result.destinationAirport)
            : true
        }))
      );
    }

    const results = allResults
      .filter((item) => item.preferredAirportMatch)
      .sort((a, b) => Number(a.price) - Number(b.price));

    const cheapest = results[0] || null;

    return res.json({
      ok: true,
      lastChecked: new Date().toISOString(),
      city,
      country,
      destinationAirportCode,
      routeCheapest: cheapest,
      results,
      source: 'amadeus',
      comparedAirports: originCodes
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error.message || 'Live flight search failed.',
      lastChecked: new Date().toISOString(),
      results: []
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`YAQOUB TRAVEL backend running on http://localhost:${PORT}`);
});
