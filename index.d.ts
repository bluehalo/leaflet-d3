/// <reference types="leaflet" />

declare namespace L {

	type SimpleFn<T> = () => T;
	type ObjectFn<T> = (d: any) => T;
	type ObjectIndexFn<T> = (d: any, i: number) => T;
	type UnionFn<T> = SimpleFn<T> | ObjectFn<T> | ObjectIndexFn<T>;

	type SimpleCallback = () => void;
	type ObjectCallback = (d: any) => void;
	type ObjectContextCallback = (d: any, t: any) => void;
	type DoubleObjectContextCallback = (d: any, t: any, th: any) => void;
	type UnionCallback = SimpleCallback | ObjectCallback | ObjectContextCallback | DoubleObjectContextCallback;

	/*
	 * Hexbins
	 */
	export interface HexbinLayer {
		data(v: any[]): this;

		colorScale(): any;
		colorScale(v: any): void;

		value(): UnionFn<number>;
		value(v: UnionFn<number>): void;

		getLatLngs(): any[];
		toGeoJSON(): any[];
	}
	export interface HexbinLayerConfig {
		radius: number,
		opacity: number,
		duration: number,

		valueFloor: number,
		valueCeil: number,
		colorRange: string[],

		lng: (d: any) => number,
		lat: (d: any) => number,
		value: (d: any) => number,
		fill: (d: any) => string,

		onmouseover: UnionCallback,
		onmouseout: UnionCallback,
		click: UnionCallback
	}
	export function hexbinLayer(config?: HexbinLayerConfig): HexbinLayer;



	/*
	 * Pings
	 */
	export interface PingLayer {
		radiusScale(): any;
		radiusScale(v: any): this;

		opacityScale(): any;
		opacityScale(v: any): this;

		getFps(): number,
		getCount(): number,

		ping(data: any, cssClass: string): this;
	}
	export interface PingLayerConfig {
		fps: number,
		duration: number,

		lng: (d: any) => number,
		lat: (d: any) => number
	}
	export function pingLayer(config?: PingLayerConfig): PingLayer;

}

export = L;
