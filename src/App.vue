<template>
  <div class="header">
    <a-space>
      <a-button type="primary" shape="circle" @click="handleClick">
        <template #icon><reload-outlined /></template>
      </a-button>
      <a-button type="primary" shape="circle">
        <template #icon><plus-outlined /></template>
      </a-button>
    </a-space>
    <div style="margin-top: 10px">
      <a-tag color="purple">purple</a-tag>
    </div>
  </div>
  <div class="list">
    <a-collapse v-model:activeKey="activeKey" :bordered="false">
      <a-collapse-panel v-for="item in list" :key="item" :header="text">
        <p>{{ text }}</p>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import { ref } from 'vue';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue';

const list = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

const activeKey = ref([]);
const text = ref('106.14.20.135');

const handleClick = async () => {
  const ret = await window.electronAPI.ping('anchel');
  console.log('handleClick', ret);
  text.value = ret;
};
</script>

<style>
html, body {
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped lang="less">
.header {

}
.list {
  margin-top: 10px;
  padding-bottom: 80px;
  flex: 1;
  overflow: auto;
}
</style>
