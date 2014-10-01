# Leaflet D3 Hexbin Plugin
> Dynamic d3.js hexbin overlays on Leaflet maps

[![Build Status][travis-image]][travis-url]

## Description
This is a Leaflet plugin that enables you to place a d3.js hexbin heatmap overlay onto your maps. This plugin is based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps). The primary difference is that this plugin leverages the data-binding power of d3 to allow you to dynamically update the data and visualize the transitions.

## Documentation
To use, simply declare a hexbin layer and add it to your map. You can then add data to the layer.

```js
var hexLayer = L.hexbinLayer({}).addTo(map);
hexLayer.update([...data...]);
```
There are several customizations. You can override the way that data is accessed by providing accessor functions.

## Credits
This plugin was based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps).

[travis-url]: https://travis-ci.org/Asymmetrik/leaflet-hexbin/
[travis-image]: https://travis-ci.org/Asymmetrik/leaflet-hexbin.svg
