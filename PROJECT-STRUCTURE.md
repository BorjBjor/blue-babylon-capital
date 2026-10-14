# AlgoLodge website – structure

GitHub Pages publishes from main / (root). Keep index.html, results.html, strategy.html and CNAME at root.

- `assets/images/` – original AlgoLodge, AvaTrade and DupliTrade logos
- `assets/css/` – styles for home, results and strategy pages
- `assets/js/` – scripts for home, results and strategy pages
- `data/` – preliminary performance data; replace or remove before public launch

The HTML pages reference assets via relative paths. The results script loads `data/performance-data.json`.

This is a restructuring of the existing 2.5 site, not a new redesign. Keep CNAME unchanged.
