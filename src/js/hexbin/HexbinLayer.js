import * as d3 from 'd3';
import * as d3Hexbin from 'd3-hexbin';
import 'leaflet';

/**
 * This is a convoluted way of getting ahold of the hexbin function.
 * - When imported globally, d3 is exposed in the global namespace as 'd3'
 * - When imported using a module system, it's a named import (and can't collide with d3)
 * - When someone isn't importing d3-hexbin, the named import will be undefined
 *
 * As a result, we have to figure out how it's being imported and get the function reference
 * (which is why we have this convoluted nested ternary statement
 */
var d3_hexbin = (null != d3.hexbin)? d3.hexbin : (null != d3Hexbin)? d3Hexbin.hexbin : null;

/**
 * L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
 * We extent L.Layer if it exists, L.Class otherwise. This is for backwards-compatibility with
 * Leaflet < 1.x
 */
L.HexbinLayer = (L.Layer ? L.Layer : L.Class).extend({
	includes: [ L.Mixin.Events ],

	/**
	 * Default options.
	 */
	options : {
		radius : 10,
		opacity: 0.5,
		duration: 200,
		lng: function(d) {
			return d[0];
		},
		lat: function(d) {
			return d[1];
		},
		value: function(d) {
			return d.length;
		},

		valueFloor: undefined,
		valueCeil: undefined,

		colorRange: [ '#f7fbff', '#08306b' ],

		fill: function(d) {
			var val = this.options.value(d);
			return (null != val) ? this._colorScale(val) : 'none';
		},

		pointerEvents: 'all'

	},

	/**
	 * Dispatcher for managing events and callbacks
	 */
	_dispatch: d3.dispatch('mouseover', 'mouseout', 'click'),

	/**
	 * Standard Leaflet initialize function, accepting an options argument provided by the
	 * user when they create the layer
	 * @param options Options object where the options override the defaults
	 */
	initialize : function(options) {
		L.setOptions(this, options);

		this._hexLayout = d3_hexbin()
			.radius(this.options.radius)
			.x(function(d) { return d.point[0]; })
			.y(function(d) { return d.point[1]; });

		this._data = [];
		this._colorScale = d3.scaleLinear()
			.range(this.options.colorRange)
			.clamp(true);

	},

	/**
	 * Callback made by Leaflet when the layer is added to the map
	 * @param map Reference to the map to which this layer has been added
	 */
	onAdd : function(map) {
		this._map = map;

		// Create a container for svg.
		this._initContainer();

		// Set up events
		map.on({ 'moveend': this._redraw }, this);

		// Initial draw
		this._redraw();
	},

	/**
	 * Callback made by Leaflet when the layer is removed from the map
	 * @param map Reference to the map from which this layer is being removed
	 */
	onRemove : function(map) {
		this._destroyContainer();

		// Remove events
		map.off({ 'moveend': this._redraw }, this);

		this._container = null;
		this._map = null;

		// Explicitly will leave the data array alone in case the layer will be shown again
		//this._data = [];
	},

	/**
	 * Create the SVG container for the hexbins
	 * @private
	 */
	_initContainer : function() {

		// If the container is null or the overlay pane is empty, create the svg element for drawing
		if (null == this._container) {
			var overlayPane = this._map.getPanes().overlayPane;
			this._container = d3.select(overlayPane).append('svg')
				.attr('class', 'leaflet-layer leaflet-zoom-hide');
		}

	},

	/**
	 * Destroy the SVG container
	 * @private
	 */
	_destroyContainer: function() {

		// Remove the svg element
		if (null != this._container) {
			this._container.remove();
		}

	},

	/**
	 * (Re)draws the hexbins data on the container
	 * @private
	 */
	_redraw : function() {
		var that = this;

		if (!that._map) {
			return;
		}

		// Generate the mapped version of the data
		var data = that._data.map(function(d) {
			var lng = that.options.lng(d);
			var lat = that.options.lat(d);

			var point = that._project([ lng, lat ]);
			return { o: d, point: point };
		});

		// Determine the bounds from the data and scale the overlay
		var padding = this.options.radius * 2;
		var bounds = this._getBounds(data);
		var width = (bounds.max[0] - bounds.min[0]) + (2 * padding),
			height = (bounds.max[1] - bounds.min[1]) + (2 * padding),
			marginTop = bounds.min[1] - padding,
			marginLeft = bounds.min[0] - padding;

		this._container
			.attr('width', width).attr('height', height)
			.style('margin-left', marginLeft + 'px')
			.style('margin-top', marginTop + 'px');

		// Select the hex group for the current zoom level. This has
		// the effect of recreating the group if the zoom level has changed
		var join = this._container.selectAll('g.hexbin')
			.data([ this._map.getZoom() ], function(d) { return d; });

		// enter
		var enter = join.enter().append('g')
			.attr('class', function(d) { return 'hexbin zoom-' + d; });

		// enter + update
		var enterUpdate = enter.merge(join);
		enterUpdate.attr('transform', 'translate(' + -marginLeft + ',' + -marginTop + ')');

		// exit
		join.exit().remove();

		// add the hexagons to the select
		this._createHexagons(enterUpdate, data);

	},

	_createHexagons : function(g, data) {
		var that = this;

		// Create the bins using the hexbin layout
		var bins = that._hexLayout(data);

		// Determine the extent of the values
		var extent = d3.extent(bins, function(d) {
			return that.options.value(d);
		});

		// If either's null, initialize them to 0
		if (null == extent[0]) extent[0] = 0;
		if (null == extent[1]) extent[1] = 0;

		// If they're the same, create separation where the only values will be at the top of the range
		if (extent[0] === extent[1]) extent[0] = extent[1] - 1;

		// Now apply the optional clipping of the floor and ceiling
		if (null != that.options.valueFloor) extent[0] = that.options.valueFloor;
		if (null != that.options.valueCeil) extent[1] = that.options.valueCeil;

		// Match the domain cardinality to that of the color range, to allow for a polylinear scale
		var domain = that._linearlySpace(extent[0], extent[1], that._colorScale.range().length);

		// Set the colorscale domain
		that._colorScale.domain(domain);


		// Join - Join the Hexagons to the data
		var join = g.selectAll('path.hexbin-hexagon')
			.data(bins, function(d) { return d.x + ':' + d.y; });


		// Update - set the fill and opacity on a transition (opacity is re-applied in case the enter transition was cancelled)
		join.transition().duration(that.options.duration)
			.attr('fill', that.options.fill.bind(that))
			.attr('fill-opacity', that.options.opacity)
			.attr('stroke-opacity', that.options.opacity);


		// Enter - establish the path, the fill, and the initial opacity
		join.enter().append('path')
			.attr('class', 'hexbin-hexagon')
			.style('pointer-events', that.options.pointerEvents)
			.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
			.attr('d', function(d) { return that._hexLayout.hexagon(); })
			.attr('fill', that.options.fill.bind(that))
			.attr('fill-opacity', 0.01)
			.attr('stroke-opacity', 0.01)
			.on('mouseover', function(d, i) {
				that._dispatch.call('mouseover', this, d, i);
			})
			.on('mouseout', function(d, i) {
				that._dispatch.call('mouseout', this, d, i);
			})
			.on('click', function(d, i) {
				that._dispatch.call('click', this, d, i);
			})
			.transition().duration(that.options.duration)
				.attr('fill-opacity', that.options.opacity)
				.attr('stroke-opacity', that.options.opacity);


		// Exit
		join.exit()
			.transition().duration(that.options.duration)
				.attr('fill-opacity', 0.01)
				.attr('stroke-opacity', 0.01)
				.remove();

	},

	_project : function(coord) {
		var point = this._map.latLngToLayerPoint([ coord[1], coord[0] ]);
		return [ point.x, point.y ];
	},

	_getBounds: function(data) {
		if(null == data || data.length < 1) {
			return { min: [ 0, 0 ], max: [ 0, 0 ]};
		}

		// bounds is [[min long, min lat], [max long, max lat]]
		var bounds = [ [ 999, 999 ], [ -999, -999 ] ];

		data.forEach(function(element) {
			var x = element.point[0];
			var y = element.point[1];

			bounds[0][0] = Math.min(bounds[0][0], x);
			bounds[0][1] = Math.min(bounds[0][1], y);
			bounds[1][0] = Math.max(bounds[1][0], x);
			bounds[1][1] = Math.max(bounds[1][1], y);
		});

		return { min: bounds[0], max: bounds[1] };
	},

	_linearlySpace: function(from, to, length) {
		var arr = new Array(length);
		var step = (to - from) / Math.max(length - 1, 1);

		for (var i = 0; i < length; ++i) {
			arr[i] = from + (i * step);
		}

		return arr;
	},

	/*
	 * Setter for the data
	 */
	data: function(data) {
		this._data = (null != data)? data : [];
		this._redraw();
		return this;
	},

	/*
	 * Getter/setter for the colorScale
	 */
	colorScale: function(colorScale) {
		if(undefined === colorScale) {
			return this._colorScale;
		}

		this._colorScale = colorScale;
		this._redraw();
		return this;
	},

	/*
	 * Getter/Setter for the value function
	 */
	value: function(valueFn) {
		if(undefined === valueFn) {
			return this.options.value;
		}

		this.options.value = valueFn;
		this._redraw();
		return this;
	},

	/*
	 * Getter for the event dispatcher
	 */
	dispatch: function() {
		return this._dispatch;
	},

	/*
	 * Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
	 */
	getLatLngs: function () {
		var that = this;

		// Map the data into an array of latLngs using the configured lat/lng accessors
		return this._data.map(function(d) {
			return L.latLng(that.options.lat(d), that.options.lng(d));
		});
	},

	/*
	 * Get path geometry as GeoJSON
	 */
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs(), 0)
		});
	}

});

L.hexbinLayer = function(options) {
	return new L.HexbinLayer(options);
};
