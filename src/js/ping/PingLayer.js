import * as d3 from 'd3';
import 'leaflet';

/**
 * L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
 * We extent L.Layer if it exists, L.Class otherwise. This is for backwards-compatibility with
 * Leaflet < 1.x
 */
L.PingLayer = (L.Layer ? L.Layer : L.Class).extend({
	includes: [ L.Mixin.Events ],

	/*
	 * Default options
	 */
	options : {
		fps: 32,
		duration: 800
	},

	_lastUpdate: Date.now(),
	_fps: 0,

	_mapBounds: undefined,

	/*
	 * Public Methods
	 */

	/*
	 * Getter/setter for the radius
	 */
	radiusScale: function(radiusScale) {
		if (undefined === radiusScale) {
			return this._radiusScale;
		}

		this._radiusScale = radiusScale;
		return this;
	},

	/*
	 * Getter/setter for the opacity
	 */
	opacityScale: function(opacityScale) {
		if (undefined === opacityScale) {
			return this._opacityScale;
		}

		this._opacityScale = opacityScale;
		return this;
	},

	// Initialization of the plugin
	initialize : function(options) {
		L.setOptions(this, options);

		this._radiusScale = d3.scalePow().exponent(0.35)
			.domain([ 0, this.options.duration ])
			.range([ 3, 15 ])
			.clamp(true);
		this._opacityScale = d3.scaleLinear()
			.domain([ 0, this.options.duration ])
			.range([ 1, 0 ])
			.clamp(true);
	},

	// Called when the plugin layer is added to the map
	onAdd : function(map) {
		this._map = map;

		// Init the state of the simulation
		this._running = false;

		// Create a container for svg.
		this._container = this._initContainer();
		this._updateContainer();

		// Set up events
		map.on({'move': this._move}, this);
	},

	// Called when the plugin layer is removed from the map
	onRemove : function(map) {
		this._destroyContainer();

		// Remove events
		map.off({'move': this._move}, this);

		this._container = null;
		this._map = null;
		this._data = null;
	},

	/*
	 * Method by which to "add" pings
	 */
	ping : function(data, cssClass) {
		this._add(data, cssClass);
		this._expire();

		// Start timer if not active
		if (!this._running && this._data.length > 0) {
			this._running = true;
			this._lastUpdate = Date.now();

			var that = this;
			d3.timer(function() { return that._update.apply(that); });
		}

		return this;
	},

	getFps : function() {
		return this._fps;
	},

	getCount : function() {
		return this._data.length;
	},

	/*
	 * Private Methods
	 */

	// Initialize the Container - creates the svg pane
	_initContainer : function() {
		var container = null;

		// If the container is null or the overlay pane is empty, create the svg element for drawing
		if (null == this._container) {
			var overlayPane = this._map.getPanes().overlayPane;
			container = d3.select(overlayPane).append('svg')
				.attr('class', 'leaflet-layer leaflet-zoom-hide');
		}

		return container;
	},

	// Update the container - Updates the dimensions of the svg pane
	_updateContainer : function() {
		var bounds = this._getMapBounds();
		this._mapBounds = bounds;

		this._container
			.attr('width', bounds.width).attr('height', bounds.height)
			.style('margin-left', bounds.left + 'px')
			.style('margin-top', bounds.top + 'px');

		this._update(true);
	},

	// Cleanup the svg pane
	_destroyContainer: function() {
		// Remove the svg element
		if(null != this._container) {
			this._container.remove();
		}
	},

	// Calculate the current map bounds
	_getMapBounds: function() {
		var latLongBounds = this._map.getBounds();
		var ne = this._map.latLngToLayerPoint(latLongBounds.getNorthEast());
		var sw = this._map.latLngToLayerPoint(latLongBounds.getSouthWest());

		var bounds = {
			width: ne.x - sw.x,
			height: sw.y - ne.y,
			left: sw.x,
			top: ne.y
		};

		return bounds;
	},

	// Calculate the circle coordinates for the provided data
	_getCircleCoords: function(geo) {
		var point = this._map.latLngToLayerPoint(geo);
		return { x: point.x - this._mapBounds.left, y: point.y - this._mapBounds.top };
	},

	// Update the map based on zoom/pan/move
	_move: function() {
		/* eslint-disable no-console */
		console.log('move');
		this._updateContainer();
	},

	// Add a ping to the map
	_add : function(data, cssClass) {
		// Lazy init the data array
		if (null == this._data) this._data = [];

		// Derive the spatial data
		var geo = [ this.options.lat(data), this.options.lng(data) ];
		var coords = this._getCircleCoords(geo);

		// Add the data to the list of pings
		var circle = {
			geo: geo,
			ts: Date.now(),
			nts: 0
		};
		circle.c = this._container.append('circle')
			.attr('class', (null != cssClass)? 'ping ' + cssClass : 'ping')
			.attr('cx', coords.x)
			.attr('cy', coords.y)
			.attr('r', this.radiusScale().range()[0]);

		// Push new circles
		this._data.push(circle);
	},

	// Main update loop
	_update : function(immediate) {
		var nowTs = Date.now();
		if (null == this._data) this._data = [];

		var maxIndex = -1;

		// Update everything
		for (var i=0; i < this._data.length; i++) {

			var d = this._data[i];
			var age = nowTs - d.ts;

			if (this.options.duration < age) {

				// If the blip is beyond it's life, remove it from the dom and track the lowest index to remove
				d.c.remove();
				maxIndex = i;

			}
			else {

				// If the blip is still alive, process it
				if (immediate || d.nts < nowTs) {

					var coords = this._getCircleCoords(d.geo);

					d.c.attr('cx', coords.x)
					   .attr('cy', coords.y)
					   .attr('r', this.radiusScale()(age))
					   .attr('fill-opacity', this.opacityScale()(age))
					   .attr('stroke-opacity', this.opacityScale()(age));
					d.nts = Math.round(nowTs + 1000/this.options.fps);

				}
			}
		}

		// Delete all the aged off data at once
		if (maxIndex > -1) {
			this._data.splice(0, maxIndex + 1);
		}

		// The return function dictates whether the timer loop will continue
		this._running = (this._data.length > 0);

		if (this._running) {
			this._fps = 1000/(nowTs - this._lastUpdate);
			this._lastUpdate = nowTs;
		}

		return !this._running;
	},

	// Expire old pings
	_expire : function() {
		var maxIndex = -1;
		var nowTs = Date.now();

		// Search from the front of the array
		for (var i=0; i < this._data.length; i++) {
			var d = this._data[i];
			var age = nowTs - d.ts;

			if(this.options.duration < age) {
				// If the blip is beyond it's life, remove it from the dom and track the lowest index to remove
				d.c.remove();
				maxIndex = i;
			}
			else {
				break;
			}
		}

		// Delete all the aged off data at once
		if (maxIndex > -1) {
			this._data.splice(0, maxIndex + 1);
		}
	}

});

L.pingLayer = function(options) {
	return new L.PingLayer(options);
};
