# YAQOUB TRAVEL

A responsive travel discovery and booking-link website for **YAQOUB TRAVEL — Travel More. Pay Less.** Built with plain HTML, CSS and JavaScript; no build tools or paid services required.

## Run and publish

Open `index.html` in a browser or host the repository as a static site (for example, enable GitHub Pages in the repository's Pages settings and select the `main` branch). No API credentials, server, or subscription are needed for the current version.

## What works

- Responsive, anchored navigation for home, flights, hotels, destinations, special deals, about, contact and FAQ.
- Flight form with AUH/DXB origins, destination suggestions, one-way/return dates, traveller count and four cabin classes. Submitting validates the trip and opens Google Flights, with a link to compare the other departure airport.
- Hotel search with destination, date, guests and room fields; validation and a Booking.com search link with destination, dates, currency and rooms.
- Search result messages are explicit that this site does not currently have live API results. Airline/hotel availability, fares, property details and booking are handled by the external provider.
- Destination inspiration, contact email link, hotel/flight tabs, responsive mobile menu, and expandable FAQ.
- No checkout, collection of payment details, fabricated inventory, live-price claims, or invented discount prices.

## Live data integration

The current searches are provider hand-offs, **not an API integration**. They do not retrieve or display live flight/hotel results on this site. To add on-site live results, choose and configure a legitimate provider/API, review its current pricing, terms, attribution and permitted booking links, and implement a server-side proxy. Store API credentials only in server-side environment secrets; never put secrets in `script.js` or other public files. No API plan or paid service has been activated.

Hotel imagery and destination imagery are editorial inspiration images (Unsplash); they are not specific live property listings. The site explicitly directs visitors to the provider for real hotels, current photos, ratings and rates. Special-deal cards are destination inspiration and do not claim discounts or savings.

## Contact

The contact link currently opens an email addressed to `hello@yaqoubtravel.com`. Replace it with the agency's verified contact address before launch if this mailbox is not configured.
