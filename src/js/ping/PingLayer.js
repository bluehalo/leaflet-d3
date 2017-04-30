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
		duration: 800,
		fps: 32,
		opacityRange: [ 1, 0 ],
		radiusRange: [ 3, 15 ]
	},


	// Initialization of the plugin
	initialize : function(options) {
		L.setOptions(this, options);

		this._fn = {
			lng: function(d) { return d[0]; },
			lat: function(d) { return d[1]; },
			radiusScaleFactor: function(d) { return 1; }
		};

		this._scale = {
			radius: d3.scalePow().exponent(0.35),
				opacity: d3.scaleLinear()
		};

		this._lastUpdate = Date.now();
		this._fps = 0;
		this._mapBounds = undefined;

		this._scale.radius
			.domain([ 0, this.options.duration ])
			.range(this.options.radiusRange)
			.clamp(true);
		this._scale.opacity
			.domain([ 0, this.options.duration ])
			.range(this.options.opacityRange)
			.clamp(true);
	},

	// Called when the plugin layer is added to the map
	onAdd : function(map) {

		// Store a reference to the map for later use
		this._map = map;

		// Init the state of the simulation
		this._running = false;

		// Create a container for svg
		this._initContainer();
		this._updateContainer();

		// Set up events
		map.on({'move': this._move}, this);

	},

	// Called when the plugin layer is removed from the map
	onRemove : function(map) {

		// Destroy the svg container
		this._destroyContainer();

		// Remove events
		map.off({'move': this._move}, this);

		this._container = null;
		this._map = null;
		this._data = null;
	},


	/*
	 * Private Methods
	 */

	// Initialize the Container - creates the svg pane
	_initContainer : function() {

		// If the container is null or the overlay pane is empty, create the svg element for drawing
		if (null == this._container) {

			// The svg is in the overlay pane so it's drawn on top of other base layers
			var overlayPane = this._map.getPanes().overlayPane;

			// The leaflet-zoom-hide class hides the svg layer when zooming
			this._container = d3.select(overlayPane).append('svg')
				.attr('class', 'leaflet-layer leaflet-zoom-hide');
		}

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
		this._updateContainer();
	},

	// Add a ping to the map
	_add : function(data, cssClass) {
		// Lazy init the data array
		if (null == this._data) this._data = [];

		// Derive the spatial data
		var geo = [ this._fn.lat(data), this._fn.lng(data) ];
		var coords = this._getCircleCoords(geo);

		// Add the data to the list of pings
		var circle = {
			data: data,
			geo: geo,
			ts: Date.now(),
			nts: 0
		};
		circle.c = this._container.append('circle')
			.attr('class', (null != cssClass)? 'ping ' + cssClass : 'ping')
			.attr('cx', coords.x)
			.attr('cy', coords.y)
			.attr('r', this._fn.radiusScaleFactor.call(this, data) * this._scale.radius.range()[0]);

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
					   .attr('r', this._fn.radiusScaleFactor.call(this, d.data) * this._scale.radius(age))
					   .attr('fill-opacity', this._scale.opacity(age))
					   .attr('stroke-opacity', this._scale.opacity(age));
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
	},

	/*
	 * Public Methods
	 */

	duration: function(v) {
		if (!arguments.length) { return this.options.duration; }
		this.options.duration = v;

		return this;
	},

	fps: function(v) {
		if (!arguments.length) { return this.options.fps; }
		this.options.fps = v;

		return this;
	},

	lng: function(v) {
		if (!arguments.length) { return this._fn.lng; }
		this._fn.lng = v;

		return this;
	},

	lat: function(v) {
		if (!arguments.length) { return this._fn.lat; }
		this._fn.lat = v;

		return this;
	},

	radiusRange: function(v) {
		if (!arguments.length) { return this.options.radiusRange; }
		this.options.radiusRange = v;
		this._scale.radius().range(v);

		return this;
	},

	opacityRange: function(v) {
		if (!arguments.length) { return this.options.opacityRange; }
		this.options.opacityRange = v;
		this._scale.opacity().range(v);

		return this;
	},

	radiusScale: function(v) {
		if (!arguments.length) { return this._scale.radius; }
		this._scale.radius = v;

		return this;
	},

	opacityScale: function(v) {
		if (!arguments.length) { return this._scale.opacity; }
		this._scale.opacity = v;

		return this;
	},

	radiusScaleFactor: function(v) {
		if (!arguments.length) { return this._fn.radiusScaleFactor; }
		this._fn.radiusScaleFactor = v;

		return this;
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
			d3.timer(function() { that._update.call(that, false) });
		}

		return this;
	},

	getActualFps : function() {
		return this._fps;
	},

	data : function() {
		return this._data;
	},

});

L.pingLayer = function(options) {
	return new L.PingLayer(options);
};
