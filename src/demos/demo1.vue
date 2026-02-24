<!--
 * @Title:
 * @Author: zhangzhiwei
 * @Date: 2026-02-24 12:41:19
 * @FilePath: \src\demos\demo1.vue
 * @Description:
-->
<template>
  <div class="w-full h-full relative" id="cesiumContainer"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import cesiumAPI from '../api';
const cesiumViewer = ref(null);
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTM4NTEwNS03YmYwLTRlOGItOTA2MC0wMjk4MGI4OWI1MDciLCJpZCI6MzkwODM2LCJpYXQiOjE3NzExNzA5NjV9.EwpUC3JKxRoLHEC-a0lijqzrvzs_b49qM9tIFMivrUQ';

onMounted(async () => {
  try {
    // 初始化 Cesium Viewer
    cesiumViewer.value = await cesiumAPI.initViewer('cesiumContainer', {
      token: token,
    });
    // 跳转到武汉（经度：114.30556，纬度：30.59278）
    console.log('Attempting to fly to Wuhan...');
    console.log('cesiumViewer.value:', cesiumViewer.value);

    const Cesium = window.Cesium;
    console.log('window.Cesium:', Cesium);

    if (Cesium && cesiumViewer.value && cesiumViewer.value.camera) {
      console.log('All prerequisites available, executing flyTo...');

      try {
        // 使用 camera.flyTo 方法，这是正确的方法来设置相机位置
        cesiumViewer.value.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(114.30556, 30.59278, 10000), // 添加高度参数，单位为米
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45), // 调整视角，使地球表面可见
            roll: 0.0,
          },
          duration: 3, // 飞行持续时间，单位为秒
          complete: function() {
            console.log('Fly to Wuhan completed successfully!');
          },
          cancel: function() {
            console.log('Fly to Wuhan was cancelled.');
          },
          error: function(error) {
            console.error('Error during flyTo:', error);
          }
        });
      } catch (flyError) {
        console.error('Exception during flyTo:', flyError);
      }
    } else {
      console.error('Missing prerequisites for flyTo:', {
        Cesium: !!Cesium,
        cesiumViewer: !!cesiumViewer.value,
        camera: cesiumViewer.value ? !!cesiumViewer.value.camera : false
      });
    }

    console.log('Cesium Viewer initialized:', cesiumViewer.value);
  } catch (error) {
    console.error('Error initializing Cesium Viewer:', error);
  }
});
</script>

<style scoped></style>
