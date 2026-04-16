# @bluehalo/leaflet-d3

[![CI](https://github.com/bluehalo/leaflet-d3/actions/workflows/ci.yml/badge.svg)](https://github.com/bluehalo/leaflet-d3/actions/workflows/ci.yml)
[![Code Coverage](https://codecov.io/gh/bluehalo/leaflet-d3/graph/badge.svg)](https://codecov.io/gh/bluehalo/leaflet-d3)

> Leaflet D3
> Provides a collection of [D3.js](http://d3js.org) based visualization plugins for [Leaflet](http://leafletjs.com/).
> Supports D3 v7

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Hexbins API](docs/API.md#hexbins-api)
- [Pings API](docs/API.md#pings-api)
- [Changelog](#changelog)
- [Contribute](#contribute)
- [License](#license)
- [Credits](#credits)


## Install
Install the package and its peer dependencies via npm:
```
npm install @bluehalo/leaflet-d3 d3 d3-hexbin leaflet
```

If you want to grab the source files directly without using npm, or you want to run the examples, you can build the dist files directly.
Simply check out the repository, and then build it with the following commands:
```
git clone git@github.com:bluehalo/leaflet-d3.git
cd leaflet-d3
npm install
npm run build
```

## Usage

### Hexbins
Create dynamic hexbin-based heatmaps on Leaflet maps.
This plugin is based on [the work of Steven Hall](https://gist.github.com/sghall/8167665).
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

There's more documentation on how to customize the behavior of the hover handlers in the [API docs](docs/API.md#hexbins-api).


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

Full API documentation is in [docs/API.md](docs/API.md#hexbins-api). It covers:
- `L.hexbinLayer(options)` — layer creation and all configuration options
- Accessor methods: `data()`, `radius()`, `opacity()`, `duration()`, color/radius scales and domains, `lng()`/`lat()`, `colorValue()`/`radiusValue()`, `fill()`, `dispatch()`
- `L.HexbinHoverHandler` — built-in `tooltip`, `resizeFill`, `resizeScale`, `compound` handlers, and the custom handler interface


## Pings API

Full API documentation is in [docs/API.md](docs/API.md#pings-api). It covers:
- `L.pingLayer(options)` — layer creation and all configuration options
- Accessor methods: `ping()`, `duration()`, `fps()`, `radiusRange()`, `opacityRange()`, radius/opacity scales, `radiusScaleFactor()`, `lng()`/`lat()`, `data()`, `getActualFps()`


## Changelog

See [CHANGES.md](CHANGES.md) for the full version history.


## Contribute
PRs accepted. Please make contributions on feature branches and open a pull request against `master`.


## License
See [LICENSE](LICENSE) for details.


## Credits
The hexbin portion of this plugin was based on [the work of Steven Hall](https://gist.github.com/sghall/8167665) ([@sghall](https://github.com/sghall)).

D3.js was created by the legendary [Mike Bostock](https://github.com/mbostock).

[Leaflet](http://leafletjs.com/) is maintained by [lots of cool people](https://github.com/Leaflet/Leaflet/graphs/contributors).
