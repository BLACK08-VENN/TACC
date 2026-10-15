# TACC Room Studio

Interactive Three.js room designer with TACC branding, textured floors, glass balcony rails, movable décor, duplication and browser-local saved designs.

## Run locally

Run `bash scripts/build-catalog.sh`, then `python3 -m http.server 8080 --directory dist`. Open http://localhost:8080. The build extracts the catalogue photo packs into individual static images.

## Deploy

Import this repository into Vercel using the Other framework preset. The build command is `bash scripts/build-catalog.sh` and the output directory is `dist`. No package installation is required. The photo packs stay in Git; the deployment serves only the extracted photos.

## Fabric studio

Fabric → Upholstery / Curtains / Cushions. Upholstery supports L-shaped seating, two accent chairs, a two-seater and a six-seat 3+2+1 arrangement. Furniture shapes are illustrative.

Product references, source image URLs, widths, prices and verification date are stored in `assets/fabrics/catalog.json`. Only records with `perMetre: true` have a confirmed per-metre unit. Other prices are listing prices, and estimates require the customer to enter their confirmed quoted rate. Fabric requirements are entered by the customer; the app does not infer yardage from sample furniture geometry.

## Approved upholstery collection

The 12 upholstery swatches supplied by the client are tagged `approved` in the fabric catalogue. Nine uploaded images have descriptive preview names until product identity and pricing are supplied. Galaxy Cream, Nurnberg Brown Floral and Molfino Dark Green are identified from uploaded saved TACC product pages. Listed prices are separate from confirmed per-metre rates. Photo proportions are preserved in texture mapping, with adjustable visual pattern size. Older fabrics remain available only for saved-design compatibility.

## Client-selected tiles

Eight uploaded photos correspond to six distinct tile designs. Exact image duplicates (uploads 2/7 and 3/9) share one option. Tile dimensions, grout and surface finish are user-adjustable visual assumptions until the actual specifications are supplied. Source references are in `assets/tiles/catalog.json`; no product price is inferred from the photos.

## Curtain catalogue import

The 15 October 2026 snapshot of TACC category 9113 includes 1,341 products, with 1,299 official product photos. The two earlier curtain entries outside this category are retained. Use search, plain/patterned filters, price sorting and 24-item pages in Fabric → Curtains. Source links, source image URLs, widths, category names and listed prices are preserved in `assets/curtains/imported-catalog.js`. No per-metre rate is inferred from a listing price. The 42 records with no photo are listed but cannot be applied to the preview.

Photos are resized to a maximum of 700 pixels and encoded as WebP, without colour changes, pattern generation or AI processing. Browser images and texture maps are served locally. Texture preparation and pattern scaling remain illustrative; compare the original swatch and physical fabric.

To refresh, install Python Pillow, then run `python3 scripts/import-curtains.py --download`. Review the changed catalogue and photo packs, run `bash scripts/build-catalog.sh`, and deploy. `--source /path/to/products.json` can use a previously fetched WooCommerce Store API snapshot.
