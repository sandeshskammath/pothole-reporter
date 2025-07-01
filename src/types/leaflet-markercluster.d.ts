declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';

  interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number | ((zoom: number) => number);
    polygonOptions?: L.PolylineOptions;
    singleMarkerMode?: boolean;
    spiderLegPolylineOptions?: L.PolylineOptions;
    spiderfyDistanceMultiplier?: number;
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
    chunkedLoading?: boolean;
    chunkInterval?: number;
    chunkDelay?: number;
    chunkProgress?: (processed: number, total: number, elapsed: number) => void;
  }

  interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    getBounds(): L.LatLngBounds;
  }

  class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    hasLayer(layer: L.Layer): boolean;
    
    refreshClusters(layers?: L.Marker[]): this;
    getVisibleParent(marker: L.Marker): L.Marker;
    
    static extend(props: any): typeof MarkerClusterGroup;
  }

  declare module 'leaflet' {
    namespace L {
      class MarkerClusterGroup extends L.FeatureGroup {
        constructor(options?: MarkerClusterGroupOptions);
        
        addLayer(layer: L.Layer): this;
        removeLayer(layer: L.Layer): this;
        clearLayers(): this;
        hasLayer(layer: L.Layer): boolean;
        
        refreshClusters(layers?: L.Marker[]): this;
        getVisibleParent(marker: L.Marker): L.Marker;
      }
    }
  }

  export default MarkerClusterGroup;
}