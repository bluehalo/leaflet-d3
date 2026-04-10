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

## 5.x
Skipped

## 4.4.0
- Minor version updates for d3 and leaflet

## 4.2.0
- Corrected the algorithm that filters out hexbins to avoid drawing those that fall outside of the visible bounds of the map

## 4.1.0
- Added `colorDomain` and `radiusDomain` options to the hexbin layer

## 4.0.0
- D3 v5 support
- Fix for Leaflet > 1.2 mixins deprecation warning
- Fixes for hover handler data and tooltip positions (issues #45 and #50, thanks @ninio)
- Migrated build system to npm scripts

## 3.x
- Dropped support for Leaflet 0.7.x (use 2.x for continued Leaflet 0.7.x support)
- Hexbin/Ping layers now zoom with the map before redrawing (switched HexbinLayer to extend the built-in Leaflet SVG layer)
- Automatic filtering of off-map hexbins — dramatically improves performance at high zoom levels
- Built-in support for tooltips and hover events via `HexbinHoverHandler`

## 2.x
- Major API refactor: most config options moved to chainable function calls
- Hexbins now support a `radiusValue` function to map data dimensions to hexbin size
- Hexbin events migrated from callbacks to a D3 dispatch object (`hexLayer.dispatch().on(...)`)
- Pings now track the map when panning
- Added `pingLayer.radiusScaleFactor()` for per-ping size scaling
