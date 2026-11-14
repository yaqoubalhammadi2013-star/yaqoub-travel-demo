# YAQOUB TRAVEL Demo Website

A simple, public-facing travel planner demo with a refresh button and honest “demo mode” pricing status.

## What this includes
- Destination trip form
- Saved trips with local browser storage
- Destination image cards
- Refresh button for daily price checks
- Clear message that prices are not live until a real API is connected
- No fake pricing claims

## How to use it
1. Open `index.html` in a browser, or host it on any static web host.
2. Create a trip.
3. Click “Refresh prices” or the individual trip refresh button.
4. Watch the prices update as a demo-only status.

## Important note
This page is intentionally honest:
- It does not use real flight APIs.
- It does not pretend to show live prices.
- It displays “Demo: not verifiable” until a production Amadeus integration is added.

## Better live version
To make this truly live, connect a real Amadeus or flight API backend and replace the demo refresh logic in `script.js` with real flight-offer requests.

## GitHub Pages idea
If you enable GitHub Pages for this repository, the site can be published as a public website link.

