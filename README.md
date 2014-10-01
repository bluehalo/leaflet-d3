# Leaflet D3 Hexbin Plugin
> Dynamic d3.js hexbin overlays on Leaflet maps

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]

# Documentation
To use, simply declare a hexbin layer and add it to your map. You can then add data to the layer.

```js
var hexLayer = L.hexbinLayer({}).addTo(map);
hexLayer.update([...data...]);
```


# Credits
This plugin was based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps).


[downloads-image]: http://img.shields.io/npm/dm/leaflet-hexbin.svg
[npm-url]: https://npmjs.org/package/leaflet-hexbin
[npm-image]: http://img.shields.io/npm/v/leaflet-hexbin.svg

[travis-url]: https://travis-ci.org/Asymmetrik/leaflet-hexbin/
[travis-image]: https://travis-ci.org/Asymmetrik/leaflet-hexbin.svg
