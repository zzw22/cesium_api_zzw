/*
 * @Title:
 * @Author: zhangzhiwei
 * @Date: 2026-02-24 11:46:09
 * @FilePath: \.dumirc.ts
 * @Description:
 */
import { defineConfig } from 'dumi';

export default defineConfig({
  apiParser: {},
  resolve: {
    entryFile: 'src/index.ts',
    docDirs: ['docs','src/doc'],
  },
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'cesium_api',
  },
  presets: [require.resolve('@dumijs/preset-vue')],
});
