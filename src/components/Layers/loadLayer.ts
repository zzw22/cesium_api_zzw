/**
 * 图层配置选项
 */
export interface LayerOptions {
  /**
   * 图层类型
   */
  layerType: 'imagery' | 'wms' | 'wmts' | '3dtiles' | 'terrain';
  /**
   * Cesium Viewer 实例
   */
  viewer: any;
  /**
   * 图层 URL
   */
  url: string;
  /**
   * 图层名称
   */
  name?: string;
  /**
   * 图层额外选项
   */
  options?: any;
}

/**
 * 根据 layerType 加载不同的图层
 * @param {LayerOptions} options - 图层配置选项
 * @returns {any} - 加载的图层实例
 */
export const loadLayer = (options: LayerOptions): any => {
  const { layerType, viewer, url, name, options: layerOptions } = options;

  if (!viewer || !url) {
    console.error('Viewer and URL are required');
    return null;
  }

  let layer: any;

  try {
    switch (layerType) {
      case 'imagery':
        // 加载影像图层
        layer = viewer.imageryLayers.addImageryProvider(
          new (window as any).Cesium.UrlTemplateImageryProvider({
            url,
            ...layerOptions
          })
        );
        break;

      case 'wms':
        // 加载 WMS 图层
        layer = viewer.imageryLayers.addImageryProvider(
          new (window as any).Cesium.WebMapServiceImageryProvider({
            url,
            layers: layerOptions?.layers || '',
            parameters: {
              service: 'WMS',
              version: '1.1.0',
              request: 'GetMap',
              format: 'image/jpeg',
              transparent: true,
              ...layerOptions?.parameters
            },
            ...layerOptions
          })
        );
        break;

      case 'wmts':
        // 加载 WMTS 图层
        layer = viewer.imageryLayers.addImageryProvider(
          new (window as any).Cesium.WebMapTileServiceImageryProvider({
            url,
            layer: layerOptions?.layer || '',
            style: layerOptions?.style || '',
            format: layerOptions?.format || 'image/jpeg',
            tileMatrixSetID: layerOptions?.tileMatrixSetID || '',
            ...layerOptions
          })
        );
        break;

      case '3dtiles':
        // 加载 3D Tiles 图层
        layer = viewer.scene.primitives.add(
          new (window as any).Cesium.Cesium3DTileset({
            url,
            ...layerOptions
          })
        );
        break;

      case 'terrain':
        // 加载地形图层
        layer = viewer.terrainProvider = new (window as any).Cesium.CesiumTerrainProvider({
          url,
          ...layerOptions
        });
        break;

      default:
        console.error('Unsupported layer type:', layerType);
        return null;
    }

    // 设置图层名称
    if (name && layer) {
      if (layer.name) {
        layer.name = name;
      } else if (layer.imageryProvider && layer.imageryProvider.name) {
        layer.imageryProvider.name = name;
      }
    }

    return layer;
  } catch (error) {
    console.error('Error loading layer:', error);
    return null;
  }
};

export default loadLayer;
