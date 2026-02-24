/*
 * @Title:
 * @Author: zhangzhiwei
 * @Date: 2026-02-15 23:04:46
 * @FilePath: \src\api\index.ts
 * @Description: Cesium API 主入口
 */
/**
 * Cesium API 主入口
 * 提供统一的 API 调用方式：cesiumAPI.方法名
 */

import loadLayer from '../components/Layers/loadLayer';


// 声明全局 cesiumAPI 对象
declare global {
  interface Window {
    cesiumAPI: any;
    Cesium: any;
  }
}

/**
 * Cesium API 类
 */
class CesiumAPI {
  // Cesium 加载状态
  private cesiumLoaded: boolean = false;
  // 加载队列，存储需要在 Cesium 加载完成后执行的回调
  private loadQueue: Array<() => void> = [];

  constructor() {
    // 在构造函数中初始化时就加载 Cesium 文件
    this.loadCesium();
  }

  /**
   * 加载 Cesium.js 和样式文件
   */
  private loadCesium() {
    // 检查是否已经加载
    if (typeof window !== 'undefined' && window.Cesium) {
      this.cesiumLoaded = true;
      this.processLoadQueue();
      return;
    }

    // 获取基础路径，确保正确加载 Cesium 文件
    const getBasePath = () => {
      // 尝试从当前路径推断
      const pathname = window.location.pathname;
      if (pathname.includes('/cesium/')) {
        // 如果当前路径已经包含 /cesium/，则使用绝对路径
        return '/';
      }
      // 否则使用相对路径
      return './';
    };

    const basePath = getBasePath();
    console.log('Using base path:', basePath);

    // 动态加载 Cesium.js
    const script = document.createElement('script');
    script.src = basePath + 'cesium/Cesium.js';
    console.log('Loading Cesium.js from:', script.src);

    script.onload = () => {
      console.log('Cesium.js loaded successfully');
      // 加载 Cesium 样式
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = basePath + 'cesium/Widgets/widgets.css';
      console.log('Loading Cesium styles from:', link.href);
      document.head.appendChild(link);

      this.cesiumLoaded = true;
      this.processLoadQueue();
    };
    script.onerror = () => {
      console.error('Failed to load Cesium.js');
      // 尝试使用绝对路径
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '/cesium/Cesium.js';
      console.log('Trying fallback path:', fallbackScript.src);
      fallbackScript.onload = () => {
        console.log('Cesium.js loaded successfully with fallback path');
        // 加载 Cesium 样式
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/cesium/Widgets/widgets.css';
        console.log('Loading Cesium styles from fallback path:', link.href);
        document.head.appendChild(link);

        this.cesiumLoaded = true;
        this.processLoadQueue();
      };
      fallbackScript.onerror = () => {
        console.error('Failed to load Cesium.js with fallback path');
      };
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  }

  /**
   * 处理加载队列中的回调
   */
  private processLoadQueue() {
    while (this.loadQueue.length > 0) {
      const callback = this.loadQueue.shift();
      if (callback) {
        callback();
      }
    }
  }

  /**
   * 等待 Cesium 加载完成
   * @returns {Promise<void>} - 加载完成的 Promise
   */
  public waitForCesium(): Promise<void> {
    return new Promise((resolve) => {
      if (this.cesiumLoaded) {
        resolve();
      } else {
        this.loadQueue.push(resolve);
      }
    });
  }

  /**
   * 加载图层
   * @param {Object} options - 图层配置选项
   * @returns {Object} - 加载的图层实例
   */
  loadLayer(options: any) {
    return loadLayer(options);
  }

  /**
   * 初始化 Cesium Viewer
   * @param {string} containerId - 容器 ID
   * @param {Object} options - 初始化选项
   * @returns {Promise<Object>} - Cesium Viewer 实例的 Promise
   */
  async initViewer(containerId: string, options: any = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return null;
    }

    // 等待 Cesium 加载完成
    await this.waitForCesium();

    // 设置默认的 Cesium Ion 访问令牌
    const defaultToken = options?.token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTM4NTEwNS03YmYwLTRlOGItOTA2MC0wMjk4MGI4OWI1MDciLCJpZCI6MzkwODM2LCJpYXQiOjE3NzExNzA5NjV9.EwpUC3JKxRoLHEC-a0lijqzrvzs_b49qM9tIFMivrUQ';

    if (typeof window !== 'undefined' && window.Cesium) {
      window.Cesium.Ion.defaultAccessToken = defaultToken;
    }

    try {
      // 检查 Cesium 是否加载
      if (!window.Cesium) {
        console.error('Cesium library is not loaded. Please make sure to include Cesium.js in your HTML.');
        console.error('You can add this script tag to your HTML: <script src="/cesium/Cesium.js"></script>');
        return null;
      }

      const viewer = new (window as any).Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: true,
        fullscreenButton: true,
        geocoder: true,
        homeButton: true,
        infoBox: true,
        sceneModePicker: true,
        selectionIndicator: true,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        token: options.token || '',
        ...options
      });

      return viewer;
    } catch (error) {
      console.error('Error initializing viewer:', error);
      return null;
    }
  }
}

// 创建并导出 CesiumAPI 实例
const cesiumAPI = new CesiumAPI();

// 暴露到全局
if (typeof window !== 'undefined') {
  window.cesiumAPI = cesiumAPI;
}

export default cesiumAPI;
