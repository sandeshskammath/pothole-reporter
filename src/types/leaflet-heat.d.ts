declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number, number?]>): this;
    addLatLng(latlng: [number, number, number?]): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): HeatLayer;

  declare module 'leaflet' {
    namespace L {
      function heatLayer(
        latlngs: Array<[number, number, number?]>,
        options?: HeatLayerOptions
      ): HeatLayer;
    }
  }

  const L: {
    heatLayer: typeof heatLayer;
  };

  export = L;
  export default L;
}