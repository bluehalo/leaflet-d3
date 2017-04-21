/// <reference types="leaflet" />

declare namespace L {

	namespace internal {

		type SimpleFn<T> = () => T;
		type ObjectFn<T> = (d: any) => T;
		type ObjectIndexFn<T> = (d: any, i: number) => T;
		type UnionFn<T> = SimpleFn<T> | ObjectFn<T> | ObjectIndexFn<T>;

		type SimpleCallback = SimpleFn<void>;
		type ObjectCallback = ObjectFn<void>;
		type ObjectContextCallback = (d: any, t: any) => void;
		type DoubleObjectContextCallback = (d: any, t: any, th: any) => void;
		type UnionCallback = SimpleCallback | ObjectCallback | ObjectContextCallback | DoubleObjectContextCallback;

	}

	/*
	 * Hexbins
	 */
	interface HexbinLayer extends L.Layer {
		data(v: any[]): this;

		colorScale(): any;
		colorScale(v: any): this;

		value(): internal.UnionFn<number>;
		value(v: internal.UnionFn<number>): this;

		getLatLngs(): any[];
		toGeoJSON(): any[];
	}

	interface HexbinLayerConfig {
		radius?: number,
		opacity?: number,
		duration?: number,

		valueFloor?: number,
		valueCeil?: number,
		colorRange?: string[],

		lng?: internal.ObjectFn<number>,
		lat?: internal.ObjectFn<number>,
		value?: internal.ObjectFn<number>,
		fill?: internal.ObjectFn<string>,

		onmouseover?: internal.UnionCallback,
		onmouseout?: internal.UnionCallback,
		click?: internal.UnionCallback
	}

	function hexbinLayer(config?: HexbinLayerConfig): HexbinLayer;



	/*
	 * Pings
	 */
	interface PingLayer extends L.Layer {
		radiusScale(): any;
		radiusScale(v: any): this;

		opacityScale(): any;
		opacityScale(v: any): this;

		getFps(): number,
		getCount(): number,

		ping(data: any, cssClass?: string): this;
	}

	interface PingLayerConfig {
		fps?: number,
		duration?: number,

		lng?: internal.ObjectFn<number>,
		lat?: internal.ObjectFn<number>
	}

	function pingLayer(config?: PingLayerConfig): PingLayer;

}
