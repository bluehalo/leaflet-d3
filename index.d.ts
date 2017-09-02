import * as L from 'leaflet';

declare module 'leaflet' {

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
		radius(): number;
		radius(v: number): this;

		opacity(): number;
		opacity(v: number): this;

		duration(): number;
		duration(v: number): this;

		colorScaleExtent(): [ number, number ];
		colorScaleExtent(v: [ number, number ]): this;

		radiusScaleExtent(): [ number, number ];
		radiusScaleExtent(v: [ number, number ]): this;

		colorRange(): string[];
		colorRange(v: string[]): this;

		radiusRange(): number[];
		radiusRange(v: number[]): this;

		colorScale(): any;
		colorScale(v: any): this;

		radiusScale(): any;
		radiusScale(v: any): this;

		lng(): internal.ObjectFn<number>;
		lng(v: internal.ObjectFn<number>): this;

		lat(): internal.ObjectFn<number>;
		lat(v: internal.ObjectFn<number>): this;

		colorValue(): internal.ObjectFn<number>;
		colorValue(v: internal.ObjectFn<number>): this;

		radiusValue(): internal.ObjectFn<number>;
		radiusValue(v: internal.ObjectFn<number>): this;

		fill(): internal.ObjectFn<string>;
		fill(v: internal.ObjectFn<string>): this;

		data(): any[];
		data(v: any[]): this;

		dispatch(): any;

		hoverHandler(): HexbinHoverHandler;
		hoverHandler(v: HexbinHoverHandler): this;

		getLatLngs(): any[];
		toGeoJSON(): any[];

		redraw(): void;
	}

	interface HexbinLayerConfig {
		radius?: number,
		opacity?: number,
		duration?: number,

		colorScaleExtent?: [ number, number ],
		radiusScaleExtent?: [ number, number ],
		colorRange?: string[],
		radiusRange?: [ number, number ],

		pointerEvents?: string
	}

	interface HexbinHoverHandler {
		mouseover(hexLayer: HexbinLayer, data: any): void;
		mouseout(hexLayer: HexbinLayer, data: any): void;
	}

	namespace HexbinHoverHandler {

		interface TooltipHoverHandler extends HexbinHoverHandler {}
		interface TooltipOptions {
			tooltipContent: (d: any) => string;
		}
		function tooltip(v: TooltipOptions): TooltipHoverHandler;

		interface ResizeFillHoverHandler extends HexbinHoverHandler {}
		function resizeFill(): ResizeFillHoverHandler;

		interface ResizeScaleHoverHandler extends HexbinHoverHandler {}
		interface ResizeScaleOptions {
			radiusScale: number;
		}
		function resizeScale(v: ResizeScaleOptions): ResizeScaleHoverHandler;

		interface CompoundHoverHandler extends HexbinHoverHandler {}
		interface CompoundOptions {
			handlers: HexbinHoverHandler[];
		}
		function compound(v: CompoundOptions): CompoundHoverHandler;

		interface NoneHoverHandler extends HexbinHoverHandler {}
		function none(): NoneHoverHandler;
	}

	function hexbinLayer(config?: HexbinLayerConfig): HexbinLayer;



	/*
	 * Pings
	 */
	interface PingLayer extends L.Layer {
		duration(): number;
		duration(v: number): this;

		fps(): number;
		fps(v: number): this;

		lng(): internal.ObjectFn<number>;
		lng(v: internal.ObjectFn<number>): this;

		lat(): internal.ObjectFn<number>;
		lat(v: internal.ObjectFn<number>): this;

		radiusRange(): number[];
		radiusRange(v: number[]): this;

		opacityRange(): number[];
		opacityRange(v: number[]): this;

		radiusScale(): any;
		radiusScale(v: any): this;

		opacityScale(): any;
		opacityScale(v: any): this;

		radiusScaleFactor(): number;
		radiusScaleFactor(v: number): this;

		ping(data: any, cssClass?: string): this;

		getActualFps(): number;
		data(): any[];

	}

	interface PingLayerConfig {
		duration?: number,
		fps?: number,
		opacityRange?: number[],
		radiusRange?: number[]
	}

	function pingLayer(config?: PingLayerConfig): PingLayer;

}
