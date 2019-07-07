# @asymmetrik/leaflet-d3

[![Build Status][travis-image]][travis-url]

> Leaflet D3
> Provides a collection of [D3.js](http://d3js.org) based visualization plugins for [Leaflet](http://leafletjs.com/).
> Now supports D3 v5

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Hexbins API](#hexbins-api)
- [Pings API](#pings-api)
- [Changelog](#changelog)
- [Contribute](#contribute)
- [License](#license)
- [Credits](#credits)


## Install 
Install the package and its peer dependencies via npm:
```
npm install d3 d3-hexbin leaflet
```

If you want to grab the source files directly without using npm, or you want to run the examples, you can build the dist files directly.
Simply check out the repository, and then build it with the following commands:
```
git clone git@github.com:Asymmetrik/leaflet-d3.git
cd leaflet-d3
npm install
npm run build
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

#### Tooltips

You have a couple options when it comes to providing tooltips for your users.
First, you can register for the appropriate hover events and manually access/manipulate the dom to show/hide tooltips.
Second, you can leverage the built-in hover handlers, which try to encapsulate a lot of this behavior.

```
var hexLayer = L.hexbinLayer()
	.hoverHandler(L.HexbinHoverHandler.tooltip());
```

This handler, combined with CSS, can be used to show a tooltip and highlight the hovered hexbin.
In the following example, we change the stroke color and show a tooltip.

```
.hexbin-container:hover .hexbin-hexagon {
	transition: 200ms;
	stroke: orange;
	stroke-width: 1px;
	stroke-opacity: 1;
}

.hexbin-tooltip {
	padding: 8px;
	border-radius: 4px;
	border: 1px solid black;
	background-color: white;
}
```

There's more documentation on how to customize the behavior of the hover handlers in the API docs below.


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

### L.hexbinLayer(options?: {}): L.HexbinLayer
Create a Leaflet map layer for visualizing data using colored/sized hexbin-based bins. 

```js
var hexLayer = L.hexbinLayer().addTo(map);
```

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
	colorDomain: null,
	radiusDomain: null,
	colorRange: [ '#f7fbff', '#08306b' ],
	radiusRange: [ 5, 12 ],
	
	pointerEvents: 'all'
};
```

#### radius
Default: 12 - Sets the radius on the hexbin layer (see below for details).

#### opacity
Default: 0.6 - Sets the opacity on the hexbin layer (see below for details).

#### duration
Default: 200 - Sets the transition duration for the hexbin layer (see below for details).

#### colorScaleExtent
Default: [ 1, undefined ] - Sets the extent of the color scale for the hexbin layer (see below for details).

#### radiusScaleExtent
Default: [ 1, undefined ] - This is the same exact configuration option as ```colorScaleExtent```, only applied to the radius extent.

#### colorDomain
Default: null - This is used to override the default behavior, which is to derive the color domain from the data.
Normally, you can tweak the generation of the color domain using the colorScaleExtent option.
However, if you want to set a completely custom domain, you can provide it as an array of values with this option.
The array of values will be passed directly into the domain of the color scale before rendering. 

#### radiusDomain
Default: null - This is used to override the default behavior, which is to derive the radius domain from the data.
Normally, you can tweak the generation of the radius domain using the radiusScaleExtent option.
However, if you want to set a completely custom domain, you can provide it as an array of values with this option.
The array of values will be passed directly into the domain of the radius scale before rendering.

#### colorRange
Default: [ '#f7fbff', '#08306b' ] - Sets the range of the color scale used to fill the hexbins on the layer. 

#### radiusRange
Default: [ 4, 12 ] - Sets the range of the radius scale used to size the hexbins on the layer.

#### pointerEvents
Default: 'all' - This value is passed directly to an element-level css style for ```pointer-events```.

You should only modify this config option if you want to change the mouse event behavior on hexbins.
This will modify when the events are propagated based on the visibility state and/or part of the hexbin being hovered.


### L.HexbinLayer

#### hexbinLayer.data(value?: any[])
Setter/getter for the data bound to the hexbin layer.
The default data schema for the hexin layer is:

```[ [ lng1, lat1 ], [ lng2, lat2 ], [ lng3, lat3 ]... [ lngN, latN ] ]```

Where the hexbin size is fixed at the radius and the color is linearly scaled and based on the bin count (the number of points contained in the bin).


#### hexbinLayer.redraw()
Triggers a redraw of the hexbin layer.
You should only need to use this function if you are modifying several aspects of the layer.
The only function in the API that automatically redraws is ```.data()```


#### hexbinLayer.radius(value?: number)
Setter/getter for the radius configuration option.
Radius of the hexagon grid cells in pixels.

This value should be a positive number.
This radius controls the radius of the hexagons used to bin the data but not necessarily to draw each individual hexbin.  


#### hexbinLayer.opacity(value?: number)
Setter/getter for the opacity configuration option.
The opacity of the visible hexagons.

This value should be a number between 0 and 1.
Since we are transitioning opacity as part of d3 rendering the hexbins, this is not currently controlled by CSS.
Future iterations may make this purely CSS based with the transitions applied to groups.


#### hexbinLayer.duration(value?: number)
Setter/getter for the durations configuration option. The millisecond duration of d3 transitions between states.
This value should be a non-negative number.
A value of 0 means that transitions will be instantaneous.

*Note:* The transition duration should be set to a value lower than the minimum refresh interval of your data.
What this means is that if you are going to be updating the data for the hexbin layer every 100 ms, you should keep this duration at a value of less than 100ms.
The consequence of not doing this is that hexbins will not fully complete their transitions in between changes.


#### hexbinLayer.colorScaleExtent(value?: [ number, number ])
Setter/getter for the colorScaleExtent configuration option.
This is used to override the derived extent of the color values and is specified as a tuple of the form [ min: number, max: number ].
A value of  ```undefined`` for either min or max indicates that the derived value should be retained.
 
What this means is we derive the color value extent of the data (the min/max values in the data array) as an array of the form [ min, max ].
Once we have that tuple, we override those values with the values provided by this config option.
For example, if the derived min/max is [5, 102] and ```colorScaleExtent``` is [ 1, undefined ], the resulting extent used as the domain of the colorScale will be [ 1, 102 ].
This setting is useful when you want to be explicit about the domain of values for the hexbins.
For example, when you want consistent color scales between multiple maps or within the same map.


#### hexbinLayer.radiusScaleExtent(value?: [ number, number ])
Setter/getter for the radiusScaleExtent configuration option.
This is the same exact configuration option as ```colorScaleExtent```, only applied to the radius extent.


#### hexbinLayer.colorRange(value?: [ number, number ])
Setter/getter for the colorRange configuration option.
This value is used to specify the range of the color scale used to determine the fill colors of the hexbins.

There are a lot of different ways you can specify the color range.
One option is monotone: ```[ '#f7fbff', '#f7fbff' ]```.
The most common option is a linear transition between two colors: ```[ '#f7fbff', '#08306b' ]```
You can also create divering and discrete color scales by providing more than two values (see the examples for details). 


#### hexbinLayer.radiusRange(value?: [ number, number ])
Setter/getter for the radiusRange configuration option.
This value is used to specify the range of the radius scale used to size the drawn hexbins.
This is relevant if you are providing a custom ```radiusValue``` function and want to specify the minimum and maximum drawn hexbin size. 

*Note:* Overriding this value will have no effect unless you provide a custom ```radiusValue``` function.


#### hexbinLayer.colorScale(value?: d3.scale)
Default: d3.scaleLinear - Setter/getter for the d3 scale used to map the color of each hexbin from the color value.
If you override the scale, the color range will be ignored.


#### hexbinLayer.radiusScale(value?: d3.scale)
Default: d3.scaleLinear - Setter/getter for the d3 scale used to map the radius of each hexbin from the radius value.
If you override the scale, the radius range will be ignored.


#### hexbinLayer.lng(value?: function(d, i) {})
Default: function(d) { return d[0]; } - Setter/getter for the function used to derive the value of the longitude for each object in the data array.


#### hexbinLayer.lat(value?: function(d, i) {})
Default: function(d) { return d[1]; } - Setter/getter for the function used to derive the value of the latitude for each object in the data array.


#### hexbinLayer.colorValue(value?: function(d, i) {})
Default: function(d) { return d.length; } - Setter/getter for the function used to derive the value of the color for each object in the data array.


#### hexbinLayer.radiusValue(value?: function(d, i) {})
Default: function(d) { return 1; } - Setter/getter for the function used to derive the value of the radius for each object in the data array.


#### hexbinLayer.fill(value?: function(d, i) {})
Setter/getter for the function used to derive the fill for each hexbin given the object generated by the d3 hexbin layout.
The default fill function will simply map to the colorScale, but use 'none' when there is an undefined or null value.


#### hexbinLayer.dispatch()
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

#### hexbinLayer.hoverHandler()
Default: None - Setter/getter for the hover behavior.

Hover handlers help you customize hexbin hover behavior.
Examples include growing the size of the hexbin in various ways or showing a tooltip.
If the hover handlers don't do what you want, you can always handle events yourself or implement your own hover handler.
For more details, see the section on hover handlers below.


### L.HexbinHoverHandler
All handlers are under the ```L.HexbinHoverHandler``` namespace.

Handlers are created as follows:

```js
L.HexbinHoverHandler.ResizeFill(options)
```

Here's a basic example:
```js
// Create a hexbin layer where hexbins that are hovered will grow from their 
// current radius up to the maximum radius (in this case 11)
var hexLayer = L.hexbinLayer({ duration: 400, radiusRange: [ 5, 11 ] })
	.radiusValue(function(d) { return d.length; })
	.hoverHandler(L.HexbinHoverHandler.resizeFill());
```

You can combine hover handlers with CSS to achieve interesting effects.
The above hover handler combined with the below CSS will grow hexbins on hover using a smooth animation 
and will change the stroke to orange.

```css
.hexbin-container:hover .hexbin-hexagon {
	transition: 200ms;
	stroke: orange;
	stroke-width: 1px;
	stroke-opacity: 1;
}
```


There are several provided hover handlers and they each may take options. They are described below.

#### HoverHandler.tooltip(options)
Shows a basic tooltip centered above the hexbin.

Options:
* **tooltipContent** - function(d) { return 'tooltip content here'; }


#### HoverHandler.resizeFill()
Resize the hovered hexagon to fill the current hexbin.

No options required.

#### HoverHandler.resizeScale(options)
Resize the hovered hexagon by scaling it to be a percentage larger than the maximum drawn hexagon radius.

Options:
* **radiusScale** - provides the scale factor by which to increase the radius of the hexbin. Example: ```radiusScale: 0.5``` will result in a hovered hexbin radius that is 50% larger than the maximum hexagon radius.  

#### HoverHandler.compound(options)
Combine multiple hover handlers.

Options:
* **handlers** - Array of hover handlers to combine.

#### Customizing your own Hover Handler
If you want to implement (or contribute) your own hover handler, the interface is pretty simple:

```js
L.HexbinHoverHandler.myHoverHandler = function() {

	// return the handler instance
	return {
		mouseover: function (hexLayer, data) {
			// hexLayer - reference to the L.HexbinLayer instance
			// data - reference to the data bound to the hovered hexbin
			// this - D3 wrapped DOM element for hovered hexbin
		},
		mouseout: function (hexLayer, data) {}
	};

};
```

## Pings API

### L.pingLayer(options?: {}): L.PingLayer
Create a Leaflet map layer for visualizing transient event data using animated expanding circles. 

```js
var pingLayer = L.pingLayer().addTo(map);
```

### options
Set of options for customizing the appearance/behavior of the ping layer.

Example:

```js
var options = {
	duration: 800,
	fps : 32,
	opacityRange: [ 1, 0 ],
	radiusRange: [ 5, 12 ]
};
```

#### duration
Default: 800 - Sets the transition duration for the ping layer (see below for details).

#### fps
Default: 32 - Sets the target framerate for the ping animation (see below for details).

#### opacityRange
Default: [ 1, 0 ] - Sets the range of the opacity scale used to fade out the pings as they age (see below for details). 

#### radiusRange
Default: [ 3, 15 ] - Sets the range of the radius scale used to size the pings as they age (see below for details).


### L.PingLayer

#### pingLayer.ping(value: {})
Submit a ping to the layer.
The default data schema for the ping layer is:

```[ [ lng1, lat1 ], [ lng2, lat2 ], [ lng3, lat3 ]... [ lngN, latN ] ]```

Where the ping radius scale factor is fixed at 1.


#### pingLayer.duration(value?: number)
Setter/getter for the durations configuration option.
The millisecond duration of each ping's lifecycle.

This value should be a non-negative number.
The pings will grow from their initial size/opacity to their final size/opacity over this period of time.
After this duration, the pings are removed from the map.


#### pingLayer.fps(value?: number)
Setter/getter for the fps configuration option.
The animation loop will limit DOM changes to this frequency in order to reduce the impact to the CPU.


#### pingLayer.radiusRange(value?: [ number, number ])
Setter/getter for the radiusRange configuration option.
The start/end radius applied during each ping's lifecycle.

This value should be a tuple of size two.
The pings will start at a pixel radius equal to the first number in the tuple and animate to the second number in the tuple.


#### pingLayer.opacityRange(value?: [ number, number ])
Setter/getter for the opacityRange configuration option.
The start/end opacity state applied during each ping's lifecycle.

This value should be a tuple of size two.
The pings will start at an opacity equal to the first number in the tuple and animate to the second number in the tuple.


#### pingLayer.radiusScale(value?: d3.scale)
Default: d3.scalePow().exponent(0.35) - Setter/getter for the scale used to determine the radius during the ping lifecycle. 
If you override the scale, the radius range will be ignored.


#### pingLayer.opacityScale(value?: d3.scale)
Default: d3.scaleLinear() - Setter/getter for the scale used to determine the opacity during the ping lifecycle.
If you override the scale, the opacity range will be ignored.

#### pingLayer.radiusScaleFactor(function(d) {})
Default: function(d) { return 1; } - Setter/getter for the scale factor applied to the radius of each ping.
This can be used to differentiate different events by size.


#### pingLayer.lng(value?: function(d) {})
Default: function(d) { return d[0]; } - Setter/getter for the function used to derive the value of the longitude for each object in the data array.


#### pingLayer.lat(value?: function(d) {})
Default: function(d) { return d[1]; } - Setter/getter for the function used to derive the value of the latitude for each object in the data array.


#### pingLayer.data()
Getter for the set of currently alive pings.


#### pingLayer.getActualFps()
Getter for the actual fps (based on the actual time between the last two animation frames).


## Changelog

### Version 4.x

#### 4.4.0
- Minor version updates for d3 and leaflet.

#### 4.2.0
- Corrected the algorithm that filters out hexbins to avoid drawing those that fall outside of the visible bounds of the map.

#### 4.1.0
- Added Hexbin Layer options for colorDomain and radiusDomain. See README docs for details.

#### 4.0.0
- D3 v5: We now support D3 v5. Only minor changes were required.
- Fix for Leaflet > 1.2 Mixins Deprecation Warning: Updated the events include reference to remove the warning about using L.Mixins.Events
- Fixes for Hover Handlers Data and Tooltip positions: See Issue #45 and #50, thanks @ninio for finding these.
- Migrated to npm run based build: Not really an external facing thing, but matters if you're trying to build the library.


### Version 3.x

#### Dropping Support for Leaflet 0.7.x
We added some functionality that made it hard to backward support Leaflet 0.7.x.
You can continue to use our 2.x release for Leaflet 0.7.x support, but it's unlikely that branch will see any further development/releases.
This is the primary reason for increasing the major version as this is the only change that is not backwards compatible.

#### Hexbins/Pings now Zoom with Map Before Redrawing
We switched the HebinLayer to extend the built-in Leaflet SVG layer.
This provides a bunch of advantages, including that the SVG layer is zoom-transformed with the other layers on the map.
This allowed us to leave the hexbins on the map until the zoom animation is complete, at which point the hexbin grid is recalculated and redrawn.

#### Automatic Filtering of Off-Map Hexbins
We updated the Hexbin layer code to automatically filter out points that fall outside of the visible bounds of the map.
This _dramatically_ improves performance at high zoom levels where we used to draw A LOT of paths off the map for no reason.

#### Built-in Support for Tooltips and Other Hover Events
While you could always manually manage a tooltip or some kind of hexbin hover event, we've added some code to make it easier.
Now, you can pretty easily enable some built-in tooltip/highlight behavior or implement your own.
See the API docs on HoverHandlers and the advanced hexbin example for details.



### Version 2.x

#### Lots of API changes
Read through the API changes.
A lot of things were moved from config options to being configurable via chained function call.

#### You can now bind data to the radius of Hexbins!
You can now provide a radius value function to map a dimension of your data to the size of each hexbin.

#### We changed the Hexbin event dispatch
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

#### Pings now track the map when panning!
We've changed pings so that they track the map when as it pans.
The pan changes are applied immediately even when manually setting a low fps.

#### You can now size pings independently using a scale factor callback function
We've added a configurable option (pingLayer.radiusScaleFactor(...)) to provide a function that returns a data element-specific scale factor for the ping radius.


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
