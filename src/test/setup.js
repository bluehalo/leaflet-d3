import L from 'leaflet';

// Expose Leaflet as a global so that HexbinLayer.js and PingLayer.js can attach
// to `L` at module evaluation time, matching the browser UMD usage pattern.
globalThis.L = L;
