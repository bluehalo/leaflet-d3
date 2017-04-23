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
Create dynamic hexbin-based heatmaps on Leaflet maps.
This plugin is based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps).
The primary difference is that this plugin leverages the data-binding power of d3 to allow you to dynamically update the data and visualize the transitions.

<img src="https://cloud.githubusercontent.com/assets/480701/4594707/d995541a-5091-11e4-9955-5938b1cb977a.png" alt="map with hexbins"/>

Live Demo: [JSFiddle](http://jsfiddle.net/acjnbu8t/embedded/result/)

To use, simply declare a hexbin layer and add it to your map.
You can then add data to the layer.

```js
// Create the hexbin layer and set all of the accessor functions
var hexLayer = L.hexbinLayer().addTo(map);

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

**Applying Durations:**
If your data is transforming faster than the transition duration, you may encounter unexpected behavior.
This is an artifact of how transitions interact with and cancel each other.
You should reduce the transition duration or eliminate it entirely if you are going to be using this plugin in a realtime manner.

**Color Scales:**
To use a polylinear color scale, simply provide more than two colors in the range. The domain cardinality will be adjusted automatically.
A minimum of two values is required in the color range, but a single-color range is possible by using `['blue', 'blue']` for example.
See the examples to see how diverging and discrete color scales can be used.


### Pings
Create realtime animated drops/pings/blips on a map.
This plugin can be used to indicate a transient event, such as a real-time occurrance of an event at a specific geographical location.

<img src="https://cloud.githubusercontent.com/assets/480701/4890582/5b6781ae-63a0-11e4-8e45-236eb7c75b85.gif" alt="map with pings"/>

**Live Demo:** [JSFiddle](http://jsfiddle.net/reblace/7jfhLgnq/embedded/result/)

To use, simply declare a ping layer and add it to your map.
You can then add data by calling the ping() method.

```js
// Create the ping layer and add it to the map
var pingLayer = L.pingLayer().addTo(map);

// Submit data so that it shows up as a ping with an optional per-ping css class
pingLayer.ping([ 38.991709, -76.886109 ], 'myCustomCssClass');

```

#### Styling

You will likely want to apply your own styles to the pings themselves. To do so, use the ```ping``` class.
See the following example:

```css
.ping {
	fill: steelblue;
	stroke: #222;
	stroke-width: .5px;
}
```


## Hexbins API

### L.hexbinLayer(options): L.HexbinLayer
Create a Leaflet map layer for visualizing data using colored/sized hexbin-based bins. 

### options
Set of options for customizing the appearance/behavior of the hexbin layer.

Example:

```js
var options = {
	radius : 12,
	opacity: 0.5,
	duration: 200,

	colorScaleExtent: [ 1, undefined ],
	radiusScaleExtent: [ 1, undefined ],
	colorRange: [ '#f7fbff', '#08306b' ],
	radiusRange: [ 5, 12 ],
	
	pointerEvents: 'all'
};
```

#### radius
Sets the radius on the hexbin layer (see below for details).

#### opacity
Sets the opacity on the hexbin layer (see below for details).

#### duration
Sets the transition duration for the hexbin layer (see below for details).

#### colorScaleExtent
Sets the extent of the color scale for the hexbin layer (see below for details).

#### radiusScaleExtent
This is the same exact configuration option as ```colorScaleExtent```, only applied to the radius extent.

#### colorRange
Sets the range of the color scale used to fill the hexbins on the layer. 

#### radiusRange
Sets the range of the radius scale used to size the hexbins on the layer.

#### pointerEvents
This value is passed directly to an element-level css style for ```pointer-events```. **Default:** 'all'

You should only modify this config option if you want to change the mouse event behavior on hexbins.
This will modify when the events are propagated based on the visibility state and/or part of the hexbin being hovered.


### L.HexbinLayer

#### hexbinLayer.radius(value?: number)
Setter/getter for the radius configuration option.

Radius of the hexagon grid cells in pixels. **Default:** 12

This value should be a positive number.
This radius controls the radius of the hexagons used to bin the data but not necessarily to draw each individual hexbin.  


#### hexbinLayer.opacity(value?: number)
Setter/getter for the opacity configuration option.

The opacity of the visible hexagons. **Default:** 0.6

This value should be a number between 0 and 1.
Since we are transitioning opacity as part of d3 rendering the hexbins, this is not currently controlled by CSS.
Future iterations may make this purely CSS based with the transitions applied to groups.


#### hexbinLayer.duration(value?: number)
Setter/getter for the durations configuration option.

The millisecond duration of d3 transitions between states. **Default:** 200

This value should be a non-negative number.
A value of 0 means that transitions will be instantaneous.

*Note:* The transition duration should be set to a value lower than the minimum refresh interval of your data.
What this means is that if you are going to be updating the data for the hexbin layer every 100 ms, you should keep this duration at a value of less than 100ms.
The consequence of not doing this is that hexbins will not fully complete their transitions in between changes.


#### hexbinLayer.colorScaleExtent(value?: [ number, number ])
Setter/getter for the colorScaleExtent configuration option.

This is used to override the derived extent of the color values and is specified as a tuple of the form [ min: number, max: number ]. **Default:** [ 1, undefined ]
A value of  ```undefined`` for either min or max indicates that the derived value should be retained.
 
What this means is we derive the color value extent of the data (the min/max values in the data array) as an array of the form [ min, max ].
Once we have that tuple, we override those values with the values provided by this config option.
For example, if the derived min/max is [5, 102] and ```colorScaleExtent``` is [ 1, undefined ], the resulting extent used as the domain of the colorScale will be [ 1, 102 ].
This setting is useful when you want to be explicit about the domain of values for the hexbins.
For example, when you want consistent color scales between multiple maps or within the same map.


#### hexbinLayer.radiusScaleExtent(value?: [ number, number ])
Setter/getter for the radiusScaleExtent configuration option.

This is the same exact configuration option as ```colorScaleExtent```, only applied to the radius extent. **Default:** [ 1, undefined ]


#### hexbinLayer.colorRange(value?: [ number, number ])
Setter/getter for the colorRange configuration option.

This value is used to specify the range of the color scale used to determine the fill colors of the hexbins. **Default:** [ '#f7fbff', '#08306b' ]

There are a lot of different ways you can specify the color range.
One option is monotone: ```[ '#f7fbff', '#f7fbff' ]```.
The most common option is a linear transition between two colors: ```[ '#f7fbff', '#08306b' ]```
You can also create divering and discrete color scales by providing more than two values (see the examples for details). 


#### hexbinLayer.radiusRange(value?: [ number, number ])
Setter/getter for the radiusRange configuration option.

This value is used to specify the range of the radius scale used to size the drawn hexbins.  **Default:** [ 4, 12 ]
This is relevant if you are providing a custom ```radiusValue``` function and want to specify the minimum and maximum drawn hexbin size. 

*Note:* Overriding this value will have no effect unless you provide a custom ```radiusValue``` function.


#### .colorScale(value?: d3.scale)
Setter/getter for the d3 scale used to map the color of each hexbin from the color value. **Default:** d3.scaleLinear
If you override the scale, the color range will be ignored.

#### .radiusScale(value?: d3.scale)
Setter/getter for the d3 scale used to map the radius of each hexbin from the radius value. **Default:** d3.scaleLinear
If you override the scale, the radius range will be ignored.

#### .lng(value?: function(d, i) {})
Setter/getter for the function used to derive the value of the longitude for each object in the data array. **Default:** function(d) { return d[0]; }

#### .lat(value?: function(d, i) {})
Setter/getter for the function used to derive the value of the latitude for each object in the data array. **Default:** function(d) { return d[1]; }

#### .colorValue(value?: function(d, i) {})
Setter/getter for the function used to derive the value of the color for each object in the data array. **Default:** function(d) { return d.length; }

#### .radiusValue(value?: function(d, i) {})
Setter/getter for the function used to derive the value of the radius for each object in the data array. **Default:** function(d) { return 1; }

#### .fill(value?: function(d, i) {})
Setter/getter for the function used to derive the fill for each hexbin given the object generated by the d3 hexbin layout.

The default fill function will simply map to the colorScale, but use 'none' when there is an undefined or null value.

#### .data(value?: any[])
Setter/getter for the data bound to the hexbin layer.

The default data schema for the hexin layer is:

```[ [ lng1, lat1 ], [ lng2, lat2 ], [ lng3, lat3 ]... [ lngN, latN ] ]```

Where the hexbin size is fixed at the radius and the color is linearly scaled and based on the bin count (the number of points contained in the bin).


#### .dispatch()
Getter for the d3 dispatch object that exposes mouse events for the hexbins.

Example:
```js
hexLayer.dispatch()
	.on('mouseover', function(d, i) {
		console.log({ type: 'mouseover', event: d, index: i, context: this });
	})
	.on('mouseout', function(d, i) {
		console.log({ type: 'mouseout', event: d, index: i, context: this });
	})
	.on('click', function(d, i) {
		console.log({ type: 'click', event: d, index: i, context: this });
	});
```

### Pings




## Changelog

### Version 2.x

### Lots of API changes
Read through the API changes.
A lot of things were moved from config options to being configurable via chained function call.

#### Data-bound Hexbin Radius
You can now provide a radius value function to map a dimension of your data to the size of each hexbin.

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
