import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';

// import 'ant-design-vue/dist/antd.css';
import 'ant-design-vue/dist/reset.css';

/**
 * If you enables use of Node.js API in the Renderer-process
 * ```
 * npm i -D vite-plugin-electron-renderer
 * ```
 * @see - https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
 */

createApp(App)
  .use(Antd)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
