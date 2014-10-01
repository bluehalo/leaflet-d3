# Leaflet D3 Hexbin Plugin [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]
> Dynamic d3.js hexbin overlays on Leaflet maps

# Documentation
To use, simply declare a hexbin layer and add it to your map. You can then add data to the layer.

```js
var hexLayer = L.hexbinLayer({}).addTo(map);
hexLayer.update([...data...]);
```


# Credits
This plugin was based on [[http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps][the work of Steven Hall]].
