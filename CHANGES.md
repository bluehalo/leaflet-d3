# Changelog

## 6.1.0
- Migrated package to `@bluehalo/leaflet-d3` namespace (previously `@asymmetrik/leaflet-d3`)
- Fix: hexbin locations are now deterministic across zoom levels — positions are calculated relative to the map CRS rather than the pixel origin (#79)
- Fix: `HexbinHoverHandler` TypeScript definitions now correctly include the `event: MouseEvent` parameter added in v6.0.1 (#77)
- Fix: `module` field in package.json now points to the correct path (#80)
- CI: replace Travis CI with GitHub Actions

## 6.0.1
- Fix events to work with D3 v7
- Fix ping layer removal

## 6.0.0
- Upgrade to D3 v7
