import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../js/hexbin/HexbinLayer.js';

// ---------------------------------------------------------------------------
// Helper: create a fresh HexbinLayer instance (no map attached)
// ---------------------------------------------------------------------------
function newLayer(options) {
	return L.hexbinLayer(options);
}


// ---------------------------------------------------------------------------
// Group 1: _linearlySpace — pure math
// ---------------------------------------------------------------------------
describe('HexbinLayer._linearlySpace', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('produces evenly spaced values across the full range', () => {
		expect(layer._linearlySpace(0, 10, 3)).toEqual([ 0, 5, 10 ]);
	});

	it('returns a single-element array when length is 1', () => {
		// step = (to - from) / max(0, 1) = 10/1 = 10, but we only emit i=0 → from+0 = 0
		expect(layer._linearlySpace(0, 10, 1)).toEqual([ 0 ]);
	});

	it('returns all identical values when from equals to', () => {
		expect(layer._linearlySpace(5, 5, 2)).toEqual([ 5, 5 ]);
	});

	it('handles negative ranges', () => {
		const result = layer._linearlySpace(10, 0, 3);
		expect(result[0]).toBe(10);
		expect(result[2]).toBe(0);
	});

});


// ---------------------------------------------------------------------------
// Group 2: _getBounds — pure computation over projected data
// ---------------------------------------------------------------------------
describe('HexbinLayer._getBounds', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('returns zero bounds for null input', () => {
		expect(layer._getBounds(null)).toEqual({ min: [ 0, 0 ], max: [ 0, 0 ] });
	});

	it('returns zero bounds for empty array', () => {
		expect(layer._getBounds([])).toEqual({ min: [ 0, 0 ], max: [ 0, 0 ] });
	});

	it('returns the point itself as both min and max for a single point', () => {
		expect(layer._getBounds([ { point: [ 3, 7 ] } ])).toEqual({ min: [ 3, 7 ], max: [ 3, 7 ] });
	});

	it('computes correct min and max across multiple points', () => {
		const data = [
			{ point: [ 1, 8 ] },
			{ point: [ 5, 2 ] },
			{ point: [ 3, 6 ] }
		];
		expect(layer._getBounds(data)).toEqual({ min: [ 1, 2 ], max: [ 5, 8 ] });
	});

});


// ---------------------------------------------------------------------------
// Group 3: _getExtent — extent with optional scale clipping
// ---------------------------------------------------------------------------
describe('HexbinLayer._getExtent', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	// valueFn that returns the first element of each bin
	const valueFn = (d) => d[0];

	it('uses d3.extent of the bins when scaleExtent has no overrides', () => {
		const bins = [ [ 2 ], [ 5 ], [ 1 ], [ 4 ] ];
		const result = layer._getExtent(bins, valueFn, [ null, null ]);
		expect(result).toEqual([ 1, 5 ]);
	});

	it('replaces min with scaleExtent[0] when non-null', () => {
		const bins = [ [ 2 ], [ 5 ] ];
		const result = layer._getExtent(bins, valueFn, [ 10, null ]);
		expect(result[0]).toBe(10);
		expect(result[1]).toBe(5);
	});

	it('replaces max with scaleExtent[1] when non-null', () => {
		const bins = [ [ 2 ], [ 5 ] ];
		const result = layer._getExtent(bins, valueFn, [ null, 99 ]);
		expect(result[0]).toBe(2);
		expect(result[1]).toBe(99);
	});

	it('replaces both when scaleExtent has two non-null values', () => {
		const bins = [ [ 2 ], [ 5 ] ];
		const result = layer._getExtent(bins, valueFn, [ 1, 100 ]);
		expect(result).toEqual([ 1, 100 ]);
	});

	it('returns [0, 0] for empty bins', () => {
		const result = layer._getExtent([], valueFn, [ null, null ]);
		expect(result).toEqual([ 0, 0 ]);
	});

});


// ---------------------------------------------------------------------------
// Group 4: Default options
// ---------------------------------------------------------------------------
describe('HexbinLayer default options', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('radius defaults to 12', () => {
		expect(layer.radius()).toBe(12);
	});

	it('opacity defaults to 0.6', () => {
		expect(layer.opacity()).toBe(0.6);
	});

	it('duration defaults to 200', () => {
		expect(layer.duration()).toBe(200);
	});

	it('colorRange defaults to the blue scale', () => {
		expect(layer.colorRange()).toEqual([ '#f7fbff', '#08306b' ]);
	});

	it('radiusRange defaults to [4, 12]', () => {
		expect(layer.radiusRange()).toEqual([ 4, 12 ]);
	});

	it('data defaults to an empty array', () => {
		expect(layer.data()).toEqual([]);
	});

});


// ---------------------------------------------------------------------------
// Group 5 & 6: Getter/setter chaining and side-effects
// ---------------------------------------------------------------------------
describe('HexbinLayer getter/setter chaining', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('radius(v) returns the layer for chaining', () => {
		expect(layer.radius(20)).toBe(layer);
	});

	it('radius(v) stores the value and updates the hex layout radius', () => {
		layer.radius(20);
		expect(layer.radius()).toBe(20);
		// _hexLayout radius should also be updated
		expect(layer._hexLayout.radius()).toBe(20);
	});

	it('opacity(v) returns the layer for chaining', () => {
		expect(layer.opacity(0.8)).toBe(layer);
	});

	it('opacity(v) stores the value', () => {
		layer.opacity(0.8);
		expect(layer.opacity()).toBe(0.8);
	});

	it('duration(v) returns the layer for chaining', () => {
		expect(layer.duration(400)).toBe(layer);
	});

	it('colorRange(v) returns the layer for chaining', () => {
		expect(layer.colorRange([ 'red', 'blue' ])).toBe(layer);
	});

	it('colorRange(v) updates the internal color scale range', () => {
		layer.colorRange([ 'red', 'blue' ]);
		expect(layer._scale.color.range()).toEqual([ 'red', 'blue' ]);
	});

	it('radiusRange(v) returns the layer for chaining', () => {
		expect(layer.radiusRange([ 2, 8 ])).toBe(layer);
	});

	it('radiusRange(v) updates the internal radius scale range', () => {
		layer.radiusRange([ 2, 8 ]);
		expect(layer._scale.radius.range()).toEqual([ 2, 8 ]);
	});

});


// ---------------------------------------------------------------------------
// Group 7: data() null guard
// ---------------------------------------------------------------------------
describe('HexbinLayer.data() null guard', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('coerces null to an empty array', () => {
		layer.data(null);
		expect(layer.data()).toEqual([]);
	});

	it('coerces undefined to an empty array', () => {
		layer.data(undefined);
		expect(layer.data()).toEqual([]);
	});

	it('stores a valid array unchanged', () => {
		const d = [ [ 1, 2 ], [ 3, 4 ] ];
		layer.data(d);
		expect(layer.data()).toBe(d);
	});

});


// ---------------------------------------------------------------------------
// Group 8: hoverHandler() null guard
// ---------------------------------------------------------------------------
describe('HexbinLayer.hoverHandler() null guard', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('falls back to the none() handler when null is passed', () => {
		layer.hoverHandler(null);
		const h = layer.hoverHandler();
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

});


// ---------------------------------------------------------------------------
// Group 9: L.HexbinHoverHandler static methods
// ---------------------------------------------------------------------------
describe('L.HexbinHoverHandler', () => {

	it('none() returns an object with mouseover and mouseout functions', () => {
		const h = L.HexbinHoverHandler.none();
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

	it('resizeFill() returns an object with mouseover and mouseout functions', () => {
		const h = L.HexbinHoverHandler.resizeFill();
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

	it('resizeScale() uses a default radiusScale of 0.5 when called without options', () => {
		// The closure captures options.radiusScale — smoke test that it doesn't throw
		// and returns the expected shape
		const h = L.HexbinHoverHandler.resizeScale();
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

	it('resizeScale({ radiusScale: 1.2 }) captures a custom value without throwing', () => {
		const h = L.HexbinHoverHandler.resizeScale({ radiusScale: 1.2 });
		expect(typeof h.mouseover).toBe('function');
	});

	it('compound({ handlers: [...] }) returns an object with mouseover and mouseout', () => {
		const h = L.HexbinHoverHandler.compound({ handlers: [ L.HexbinHoverHandler.none() ] });
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

	it('compound() without options defaults to none() as the inner handler without throwing', () => {
		const h = L.HexbinHoverHandler.compound();
		expect(typeof h.mouseover).toBe('function');
		expect(typeof h.mouseout).toBe('function');
	});

});


// ---------------------------------------------------------------------------
// Bug documentation: getLatLngs / toGeoJSON
//
// Both methods reference `this.options.lat` / `this.options.lng` but those
// accessors live on `this._fn`, not `this.options`.  The bug is harmless on
// empty data (returns []) but throws on non-empty data.
// ---------------------------------------------------------------------------
describe('HexbinLayer.getLatLngs — bug documentation', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('returns an empty array when data is empty (no crash)', () => {
		expect(layer.getLatLngs()).toEqual([]);
	});

	it('throws when data is non-empty because options.lat is undefined (documents bug)', () => {
		layer._data = [ [ 10, 20 ] ];
		expect(() => layer.getLatLngs()).toThrow();
	});

});


// ---------------------------------------------------------------------------
// Smoke tests — full rendering pipeline with a real Leaflet map
//
// These tests verify the DOM/D3 rendering code does not crash.
// jsdom provides the DOM; getSize() is mocked to give Leaflet a non-zero
// container size (jsdom has no layout engine so offsetWidth returns 0).
// ---------------------------------------------------------------------------

function createMap() {
	const div = document.createElement('div');
	document.body.appendChild(div);
	const map = L.map(div, { center: [ 0, 0 ], zoom: 5 });
	// jsdom has no layout engine — stub container size so _createHexagons
	// doesn't divide by zero in its bounds.pad() call.
	vi.spyOn(map, 'getSize').mockReturnValue(L.point(800, 600));
	return { map, div };
}

describe('HexbinLayer smoke tests', () => {

	let map, div, layer;

	beforeEach(() => {
		({ map, div } = createMap());
		layer = L.hexbinLayer({ duration: 0 });
	});

	afterEach(() => {
		try { layer.remove(); }
 catch (e) { /* already removed */ }
		map.remove();
		document.body.removeChild(div);
		vi.restoreAllMocks();
	});

	it('addTo(map) does not throw', () => {
		expect(() => layer.addTo(map)).not.toThrow();
	});

	it('creates an SVG element in the DOM after addTo', () => {
		layer.addTo(map);
		expect(div.querySelector('svg')).not.toBeNull();
	});

	it('data() after addTo renders without throwing', () => {
		layer.addTo(map);
		expect(() => layer.data([ [ 0, 0 ], [ 1, 1 ], [ -1, -1 ] ])).not.toThrow();
	});

	it('creates hexbin-container elements after data is set', () => {
		layer.addTo(map);
		layer.data([ [ 0, 0 ], [ 1, 1 ], [ -1, -1 ] ]);
		expect(div.querySelector('.hexbin-container')).not.toBeNull();
	});

	it('redraw() can be called directly without throwing', () => {
		layer.addTo(map);
		layer.data([ [ 0, 0 ] ]);
		expect(() => layer.redraw()).not.toThrow();
	});

	it('clearing data with data([]) does not throw', () => {
		layer.addTo(map);
		layer.data([ [ 0, 0 ], [ 1, 1 ] ]);
		expect(() => layer.data([])).not.toThrow();
	});

	it('remove() does not throw', () => {
		layer.addTo(map);
		expect(() => layer.remove()).not.toThrow();
	});

	it('_project returns coordinates matching map.project()', () => {
		layer.addTo(map);
		const result = layer._project([ 10, 20 ]); // [lng, lat]
		const expected = map.project([ 20, 10 ]);   // Leaflet: [lat, lng]
		expect(result[0]).toBe(expected.x);
		expect(result[1]).toBe(expected.y);
	});

});
