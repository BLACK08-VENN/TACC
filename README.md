# TACC Room Studio

Interactive Three.js room designer with TACC branding, textured floors, glass balcony rails, movable décor, duplication and browser-local saved designs.

## Run locally

Run `python3 -m http.server 8080` from this folder, then open http://localhost:8080.

## Deploy

Import this repository into Vercel using the Other framework preset. The static files are served from the repository root. No install or build step is required.

## Fabric studio

Fabric → Upholstery / Curtains / Cushions. Upholstery supports L-shaped seating, two accent chairs, a two-seater and a six-seat 3+2+1 arrangement. Furniture shapes are illustrative.

Product references, source image URLs, widths, prices and verification date are stored in `assets/fabrics/catalog.json`. Only records with `perMetre: true` have a confirmed per-metre unit. Other prices are listing prices, and estimates require the customer to enter their confirmed quoted rate. Fabric requirements are entered by the customer; the app does not infer yardage from sample furniture geometry.

## Approved upholstery collection

The 12 upholstery swatches supplied by the client are tagged `approved` in the fabric catalogue. Nine uploaded images have descriptive preview names until product identity and pricing are supplied. Galaxy Cream, Nurnberg Brown Floral and Molfino Dark Green are identified from uploaded saved TACC product pages. Listed prices are separate from confirmed per-metre rates. Photo proportions are preserved in texture mapping, with adjustable visual pattern size. Older fabrics remain available only for saved-design compatibility.
