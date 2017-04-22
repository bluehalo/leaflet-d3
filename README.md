# @asymmetrik/leaflet-d3

[![Build Status][travis-image]][travis-url]

> Leaflet D3
> Provides a collection of [D3.js](http://d3js.org) based visualization plugins for [Leaflet](http://leafletjs.com/).
> Now supports D3 v4

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Changelog](#changelog)
- [Contribute](#contribute)
- [License](#license)
- [Credits](#credits)


## Install 
Install the package and its peer dependencies via npm:
```
npm install d3
npm install d3-hexbin
npm install leaflet
```


## Usage

### Hexbins
Create dynamic hexbin-based heatmaps on Leaflet maps. This plugin is based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps). The primary difference is that this plugin leverages the data-binding power of d3 to allow you to dynamically update the data and visualize the transitions.

<img src="https://cloud.githubusercontent.com/assets/480701/4594707/d995541a-5091-11e4-9955-5938b1cb977a.png" alt="map with hexbins"/>

Live Demo: [JSFiddle](http://jsfiddle.net/acjnbu8t/embedded/result/)

To use, simply declare a hexbin layer and add it to your map. You can then add data to the layer.

```js
// Options for the hexbin layer
var options = {
	radius : 10,							// Size of the hexagons/bins
	opacity: 0.5,							// Opacity of the hexagonal layer
	duration: 200,							// millisecond duration of d3 transitions (see note below)
	lng: function(d){ return d[0]; },		// longitude accessor
	lat: function(d){ return d[1]; },		// latitude accessor
	value: function(d){ return d.length; },	// value accessor - derives the bin value
	valueFloor: 0,							// override the color scale domain low value
	valueCeil: undefined,					// override the color scale domain high value
	colorRange: ['#f7fbff', '#08306b']		// default color range for the heat map (see note below)
};

// Create the hexbin layer and add it to the map
var hexLayer = L.hexbinLayer(options).addTo(map);

// Set up events
hexLayer.dispatch()
	.on('mouseover', function(d, i) { })
	.on('mouseout', function(d, i) { })
	.on('click', function(d, i) { });

// Optionally, access the d3 color scale directly
// Can also set scale via hexLayer.colorScale(d3.scale.linear()...)
hexLayer.colorScale().range(['white', 'blue']);

// Set the data (can be set multiple times)
hexLayer.data([[lng1, lat1], [lng2, lat2], ... [lngN, latN]]);

```

#### Styling

You will likely want to apply your own styles to the hexbin hexagons themselves. To do so, use the ```hexbin-hexagon``` class.
See the following example:

```css
.hexbin-hexagon {
	stroke: #000;
	stroke-width: .5px;
}
```

#### Special Notes

*Applying Durations*:
If your data is transforming faster than the transition duration, you may encounter unexpected behavior.
This is an artifact of how transitions interact with and cancel each other.
You should reduce the transition duration or eliminate it entirely if you are going to be using this plugin in a realtime manner.

*Color Scales*:
To use a polylinear color scale, simply provide more than two colors in the range. The domain cardinality will be adjusted automatically.
A minimum of two values is required in the color range, but a single-color range is possible by using `['blue', 'blue']` for example.
See the examples to see how diverging and discrete color scales can be used.


### Pings
Create realtime animated drops/pings/blips on a map. This plugin can be used to indicate a transient event, such as a real-time occurrance of an event at a specific geographical location.

<img src="https://cloud.githubusercontent.com/assets/480701/4890582/5b6781ae-63a0-11e4-8e45-236eb7c75b85.gif" alt="map with pings"/>

Live Demo: [JSFiddle](http://jsfiddle.net/reblace/7jfhLgnq/embedded/result/)

To use, simply declare a ping layer and add it to your map. You can then add data by calling the ping() method.

```js
// Options for the ping layer
// lat & lng - custom accessor functions for accessing the latitude and longitude of the data object
// duration - how long the blip animation will last
// efficient.enabled - toggles 'efficient mode'
// efficient.fps - establishes the target framerate (rate of DOM updates for each individual object) when running in efficient mode
var options = {
	lng: function(d){ return d[0]; },
	lat: function(d){ return d[1]; },
	duration: 800,
	fps: 32
};

// Create the ping layer
var pingLayer = L.pingLayer(options).addTo(map);

// Optionally, access the radius scale and opacity scale
pingLayer.radiusScale().range([2, 18]);
pingLayer.opacityScale().range([1, 0]);

// Submit data so that it shows up as a ping with an optional per-ping css class
pingLayer.ping([longFn(), latFn()], 'myCustomCssClass');

```


## API
See examples for now.


## Changelog

### Version 2.x

#### Hexbin event dispatch
For Hexbins, we've changed the way that events are handled. Previously, you provided callback methods.
Now, we expose a d3 dispatch object:

```js
...
var hexLayer = L.hexbinLayer(options).addTo(map);

// Set up events
hexLayer.dispatch()
	.on('mouseover', function(d, i) { })
	.on('mouseout', function(d, i) { })
	.on('click', function(d, i) { });
```

#### Pings now track the map
We've changed pings so that they track the map when as it pans.
The pan changes are applied immediately even when manually setting a low fps.


## Contribute
PRs accepted. If you are part of Asymmetrik, please make contributions on feature branches off of the ```develop``` branch. If you are outside of Asymmetrik, please fork our repo to make contributions.


## License
See LICENSE in repository for details.


## Credits
The hexbin portion of this plugin was based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps). Check out his other awesome work at [Delimited](http://www.delimited.io/)

D3.js was created by the legendary [Mike Bostock](https://github.com/mbostock).

[Leaflet](http://leafletjs.com/) is maintained by [lots of cool people](https://github.com/Leaflet/Leaflet/graphs/contributors).


[travis-url]: https://travis-ci.org/Asymmetrik/leaflet-d3/
[travis-image]: https://travis-ci.org/Asymmetrik/leaflet-d3.svg
