/*! leaflet-d3-hexbin.js Version: 0.1.0 */
(function(){
	"use strict";

	L.HexbinLayer = L.Class.extend({
		includes : L.Mixin.Events,
	
		options : {
			radius : 10,
			padding: 100,
			minZoom: 1,
			maxZoom: 18,
			coord: function(d){
				return d.geo;
			},
			x: function(d){
				return d[0];
			},
			y: function(d){
				return d[1];
			},
			colorRange: ['#f7fbff', '#08306b']
		},
	
		initialize : function(options) {
			L.setOptions(this, options);
			this._layout = d3.hexbin().radius(this.options.radius);
			this._data = [];
			this._levels = {};
			this._colorScale = d3.scale.linear().range(this.options.colorRange);
		},
	
		onAdd : function(map) {
			this._map = map;
	
			// Create a container for svg.
			this._container = this._initContainer();
	
			// Set up events
			map.on({'moveend': this._redraw}, this);
	
			// Initial draw
			this._redraw();
		},
	
		onRemove : function(map) {
			this._destroyContainer();
	
			// Remove events
			map.off({'moveend': this._redraw}, this);
	
			this._container = null;
			this._map = null;
			this._data = null;
		},
	
		addTo : function(map) {
			map.addLayer(this);
			return this;
		},
	
		update : function(data){
			this._data = (null != data)? data : [];
			this._redraw();
		},
	
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
	
		_destroyContainer: function(){
			// Remove the svg element
			if(null != this._container){
				this._container.remove();
			}
		},
	
		// (Re)draws the hexbin group
		_redraw : function(){
			if (!this._map) {
				return;
			}
	
			var zoom = this._map.getZoom();
	
			// Determine the bounds from the data and scale the overlay
			var padding = this.options.padding;
			var geoBounds = this._getBounds(this._data);
			var bounds = this._translateBounds(geoBounds);
			var width = bounds.getSize().x + (2 * padding),
				height = bounds.getSize().y + (2 * padding),
				marginTop = bounds.min.y - padding,
				marginLeft = bounds.min.x - padding;
	
			this._layout.size([ width, height ]);
			this._container
				.attr('width', width).attr('height', height)
				.style('margin-left', marginLeft + 'px')
				.style('margin-top', marginTop + 'px');
	
			// Select the hex group for the current zoom level
			var join = this._container.selectAll('g.hexbin').data([zoom], function(d){ return d; });
	
			// enter
			join.enter().append('g').attr('class', function(d) { return 'hexbin zoom-' + d; });
	
			// enter + update
			join.attr('transform', 'translate(' + -marginLeft + ',' + -marginTop + ')');
	
			// exit
			join.exit().remove();
	
			// add the hexagons to the select
			this._createHexagons(join);
	
		},
	
		_createHexagons : function(g) {
			var that = this;
	
			// Generate the mapped version of the data
			var data = that._data.map(function(d) {
				var coord = that.options.coord(d);
				var x = that.options.x(coord);
				var y = that.options.y(coord);
	
				return that._project([x, y]);
			});
	
			// Create the bins using the hexbin layout
			var bins = that._layout(data);
			that._colorScale.domain([0, bins.reduce(function(val, element){
				return Math.max(val, element.length);
			}, 0)]);
	
			// Update the d3 visualization
			var join = g.selectAll('path.hexbin-hexagon').data(bins, function(d){ return d.i + ':' + d.j; });
			join.transition().duration(200).attr('fill', function(d){ return that._colorScale(d.length); });
	
			join.enter().append('path').attr('class', 'hexbin-hexagon')
				.attr('d', function(d){
					return 'M' + d.x + ',' + d.y + that._layout.hexagon();
				})
				.attr('fill', function(d){ return that._colorScale(d.length); })
				.attr('opacity', 0.01)
				.transition().duration(200)
				.attr('opacity', 0.4);
	
			join.exit().transition().duration(200)
				.attr('opacity', 0.01)
				.remove();
		},
	
		_project : function(coord) {
			var point = this._map.latLngToLayerPoint([ coord[1], coord[0] ]);
			return [ point.x, point.y ];
		},
	
		_translateBounds : function(bounds) {
			var nw = this._project([ bounds[0][0], bounds[1][1] ]), 
				se = this._project([ bounds[1][0], bounds[0][1] ]);
			return L.bounds(nw, se);
		},
	
		_getBounds: function(data){
			var that = this;
	
			if(null == data || data.length < 1){
				return [[0, 0], [0, 0]];
			}
	
			// bounds is [[min long, min lat], [max long, max lat]]
			var bounds = [[999, 999], [-999, -999]];
	
			data.forEach(function(element){
				var coord = that.options.coord(element);
				var x = that.options.x(coord);
				var y = that.options.y(coord);
	
				bounds[0][0] = Math.min(bounds[0][0], x);
				bounds[0][1] = Math.min(bounds[0][1], y);
				bounds[1][0] = Math.max(bounds[1][0], x);
				bounds[1][1] = Math.max(bounds[1][1], y);
			});
	
			return bounds;
		}
	
	});

	L.hexbinLayer = function(data, options) {
		return new L.HexbinLayer(data, options);
	};

})();
