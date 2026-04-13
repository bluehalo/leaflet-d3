import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../js/ping/PingLayer.js';

// ---------------------------------------------------------------------------
// Helper: create a fresh PingLayer instance (no map attached)
// ---------------------------------------------------------------------------
function newLayer(options) {
	return L.pingLayer(options);
}


// ---------------------------------------------------------------------------
// Group 1: Default options
// ---------------------------------------------------------------------------
describe('PingLayer default options', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('duration defaults to 800', () => {
		expect(layer.duration()).toBe(800);
	});

	it('fps defaults to 32', () => {
		expect(layer.fps()).toBe(32);
	});

	it('opacityRange defaults to [1, 0]', () => {
		expect(layer.opacityRange()).toEqual([ 1, 0 ]);
	});

	it('radiusRange defaults to [3, 15]', () => {
		expect(layer.radiusRange()).toEqual([ 3, 15 ]);
	});

	it('getActualFps() returns 0 before any animation has run', () => {
		expect(layer.getActualFps()).toBe(0);
	});

	it('data() returns null/undefined before any pings have been added', () => {
		// _data is not initialized until the first ping is added
		expect(layer.data() == null).toBe(true);
	});

});


// ---------------------------------------------------------------------------
// Group 2 & 3: Getter/setter chaining and side-effects
// ---------------------------------------------------------------------------
describe('PingLayer getter/setter chaining', () => {

	let layer;
	beforeEach(() => { layer = newLayer(); });

	it('duration(v) returns the layer for chaining', () => {
		expect(layer.duration(400)).toBe(layer);
	});

	it('duration(v) stores the value', () => {
		layer.duration(400);
		expect(layer.duration()).toBe(400);
	});

	it('fps(v) returns the layer for chaining', () => {
		expect(layer.fps(60)).toBe(layer);
	});

	it('fps(v) stores the value', () => {
		layer.fps(60);
		expect(layer.fps()).toBe(60);
	});

	it('opacityRange(v) returns the layer for chaining', () => {
		expect(layer.opacityRange([ 0.8, 0 ])).toBe(layer);
	});

	it('radiusRange(v) returns the layer for chaining', () => {
		expect(layer.radiusRange([ 5, 20 ])).toBe(layer);
	});

	it('radiusScaleFactor(v) returns the layer for chaining', () => {
		expect(layer.radiusScaleFactor(() => 2)).toBe(layer);
	});

	it('radiusScaleFactor(v) stores the function', () => {
		const fn = () => 2;
		layer.radiusScaleFactor(fn);
		expect(layer.radiusScaleFactor()).toBe(fn);
	});

});


// ---------------------------------------------------------------------------
// Group 4: ping() guard — no map attached
// ---------------------------------------------------------------------------
describe('PingLayer.ping() with no map', () => {

	it('returns the layer without throwing when _map is null', () => {
		const layer = newLayer();
		// _map is null at this point (layer not added to any map)
		expect(layer.ping([ 0, 0 ])).toBe(layer);
	});

});


// ---------------------------------------------------------------------------
// Smoke tests — full rendering pipeline with a real Leaflet map
// ---------------------------------------------------------------------------

describe('PingLayer smoke tests', () => {

	let map, div, layer;

	beforeEach(() => {
		div = document.createElement('div');
		document.body.appendChild(div);
		map = L.map(div, { center: [ 0, 0 ], zoom: 5 });
		layer = L.pingLayer();
	});

	afterEach(() => {
		try { layer.remove(); }
 catch (e) { /* already removed */ }
		map.remove();
		document.body.removeChild(div);
	});

	it('addTo(map) does not throw', () => {
		expect(() => layer.addTo(map)).not.toThrow();
	});

	it('creates an SVG element in the DOM after addTo', () => {
		layer.addTo(map);
		expect(div.querySelector('svg')).not.toBeNull();
	});

	it('ping() with a real map does not throw', () => {
		layer.addTo(map);
		expect(() => layer.ping([ 0, 0 ])).not.toThrow();
	});

	it('ping() populates the data array', () => {
		layer.addTo(map);
		layer.ping([ 0, 0 ]);
		expect(layer.data()).not.toBeNull();
		expect(layer.data().length).toBe(1);
	});

	it('ping() with a custom CSS class does not throw', () => {
		layer.addTo(map);
		expect(() => layer.ping([ 0, 0 ], 'my-ping')).not.toThrow();
	});

	it('multiple pings accumulate in the data array', () => {
		layer.addTo(map);
		layer.ping([ 0, 0 ]);
		layer.ping([ 1, 1 ]);
		layer.ping([ -1, -1 ]);
		expect(layer.data().length).toBe(3);
	});

	it('remove() does not throw', () => {
		layer.addTo(map);
		expect(() => layer.remove()).not.toThrow();
	});

});
