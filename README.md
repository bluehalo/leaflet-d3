# Leaflet D3 Hexbin Plugin

[![Build Status][travis-image]][travis-url]

## What is it?
This is a Leaflet plugin that enables you to place a d3.js hexbin heatmap overlay onto your maps. This plugin is based on [the work of Steven Hall](http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps). The primary difference is that this plugin leverages the data-binding power of d3 to allow you to dynamically update the data and visualize the transitions.

## How do I include this plugin in my project?
The easiest way to include this plugin in your project, use [Bower](http://bower.io)

```bash
bower install -S leaflet-hexbin
```

Alternatively, you can download the source or minified javascript files yourself from the GitHub repository (they are contained in the dist directory).

Alter-alternatively, you can clone this repo and build it yourself.

## How do I build this project?
There are several tools you will need to install to build this project:
* [Node](http://nodejs.org/)
* [Gulp](http://http://gulpjs.com/)
* [Bower](http://bower.io)

If you're on Mac OS, check out [Homebrew](https://github.com/mxcl/homebrew) to get node up and running easily.
```bash
brew install node
```

Next, you will need to install the build dependencies for the project using node. From inside the project directory, run:
```bash
npm install
```

If you want to use the examples, you will need to install the javascript dependencies for the project. To do this, run:
```bash
bower install
```

Finally, to build the project and generate the artifacts in the /dist directory, run:
```
gulp
```

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
