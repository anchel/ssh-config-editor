<template>
  <div class="header">
    <div class="oper">
      <a-space>
        <a-button type="primary" shape="circle" title="Reload" @click="handleClick">
          <template #icon>
            <reload-outlined />
          </template>
        </a-button>
        <a-button type="primary" shape="circle" title="Add Section" @click="handleAdd">
          <template #icon>
            <plus-outlined />
          </template>
        </a-button>
      </a-space>
      <div>
        <Keygen />
      </div>
    </div>
    <div style="margin-top: 10px">
      <a-tag color="purple">{{ filePath }}</a-tag>
    </div>
  </div>
  <div class="list">
    <a-collapse v-model:activeKey="activeKey" :bordered="false">
      <a-collapse-panel v-for="(item, idx) in list" :key="idx" :header="item.value">
        <div>
          <Codemirror :extensions="extensions" :modelValue="stringify(toRaw(item.config))" :disabled="true" />
          <a-space style="margin-top: 10px">
            <edit-outlined title="edit" @click="handleEdit(item, idx)" />
            <delete-outlined title="delete" @click="handleDelete(item)" />
          </a-space>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <a-modal v-model:open="visible" :title="modalTitle" @ok="handleModalOk">
    <a-form-item :label="currentItem.param" name="Host">
      <a-input v-model:value="currentItem.value" />
    </a-form-item>
    <div class="modal-item-list">
      <div class="item" v-for="(conf, idx) in currentItem.config" :key="idx">
        <a-space v-if="conf.type === 1">
          <a-select style="width: 120px" v-model:value="conf.param">
            <a-select-option value="HostName">HostName</a-select-option>
            <a-select-option value="User">User</a-select-option>
            <a-select-option value="Port">Port</a-select-option>
            <a-select-option value="IdentityFile">IdentityFile</a-select-option>
            <a-select-option value="LogLevel">LogLevel</a-select-option>
            <a-select-option value="Compression">Compression</a-select-option>
          </a-select>
          <a-auto-complete
            v-if="conf.param === 'IdentityFile'"
            v-model:value="conf.value"
            :options="optionsIF"
            style="width: 300px"
            placeholder=""
            @select="onSelect"
            @search="onSearch"
          />
          <a-input v-else style="width: 300px" v-model:value="conf.value" />

          <delete-outlined title="delete" @click="handleDelConfigItem(currentItem, idx)" />
        </a-space>
        <a-space v-if="conf.type === 2">
          <a-input style="width: 300px" v-model:value="conf.content" />
          <delete-outlined title="delete" @click="handleDelConfigItem(currentItem, idx)" />
        </a-space>
      </div>
    </div>
    <div style="margin-top: 10px">
      <a-space>
        <a-button type="primary" shape="circle" @click="handleAddConfigItem(currentItem)">
          <template #icon>
            <plus-outlined />
          </template>
        </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import { ref, unref, toRaw, onMounted, reactive } from 'vue';
import { Modal } from 'ant-design-vue';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import Keygen from './components/keygen.vue';
import { Codemirror } from 'vue-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

const activeKey = ref([]);

const list = ref<any[]>([]);
const getConfigList = async () => {
  const ret = await window.electronAPI.getList();
  console.log('getConfigList', ret);
  list.value = ret;
};

const optionsIF = ref([]);
const onSelect = (value: any) => {
  console.log('onSelect', value);
};

const onSearch = async (value: any) => {
  console.log('onSearch', value);
  let idx = value.lastIndexOf('/');
  if (idx === -1) {
    idx = value.lastIndexOf('\\');
  }
  const keyword = value.substring(idx + 1);
  optionsIF.value = await window.electronAPI.searchIF(keyword);
};

onMounted(async () => {
  await getConfigList();
});

const filePath = ref('');
onMounted(async () => {
  filePath.value = await window.electronAPI.getPath();
});

const handleClick = async () => {
  // // const ret = await window.electronAPI.ping('anchel');
  // // console.log('handleClick', ret);
  // // const ret = await window.electronAPI.ping();
  // const rawList = toRaw(list.value);
  // console.log('handleClick', rawList);
  // stringify(rawList);
  await getConfigList();
};

const stringify = (conf: any) => {
  return window.electronAPI.stringify(conf);
};

const extensions = [oneDark];

const handleDelete = async (item: any) => {
  Modal.confirm({
    title: 'Delete Confirm',
    content: 'Are you sure to delete this config?',
    okText: 'Yes',
    cancelText: 'No',
    onOk: async () => {
      await window.electronAPI.deleteConfig(toRaw(item));
      await getConfigList();
    },
  });
};

// 对话框
const modalTitle = ref('Add');
const visible = ref(false);
const currentItem = ref<any>({});
const currentIdx = ref<number>(-1);
const opType = ref('add');

const handleEdit = (item: any, idx: number) => {
  opType.value = 'edit';
  currentIdx.value = idx;
  currentItem.value = JSON.parse(JSON.stringify(toRaw(item)));
  visible.value = true;
  onSearch('');
};

const handleAdd = () => {
  opType.value = 'add';
  currentItem.value = {
    type: 1,
    param: 'Host',
    value: '',
    config: [
      {
        type: 1,
        param: 'HostName',
        separator: ' ',
        value: '',
        before: '  ',
        after: '\n',
      },
    ],
  };
  visible.value = true;
  onSearch('');
};

const handleAddConfigItem = (item: any) => {
  item.config.push({
    type: 1,
    param: 'HostName',
    separator: ' ',
    value: '',
    before: '  ',
    after: '\n',
  });
};

const handleDelConfigItem = (item: any, idx: number) => {
  item.config.splice(idx, 1);
};

const prepend = ref(false);

const handleModalOk = async () => {
  const rawCurrentItem = toRaw(currentItem.value);
  console.log('rawCurrentItem', rawCurrentItem);
  if (opType.value === 'add') {
    const findItem = list.value.find(
      (line: any) => line.param === rawCurrentItem.param && line.value === rawCurrentItem.value,
    );
    if (findItem) {
      Modal.warning({
        title: 'Warning',
        content: 'The config already exists!',
      });
      return;
    }
  }

  if (opType.value === 'edit') {
    await window.electronAPI.editConfig(rawCurrentItem, currentIdx.value);
  } else {
    await window.electronAPI.addConfig(rawCurrentItem, prepend.value);
  }
  visible.value = false;
  await getConfigList();
};
</script>

<style>
html,
body {
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
  .oper {
    display: flex;
    justify-content: space-between;
  }
}

.list {
  margin-top: 10px;
  padding-bottom: 80px;
  flex: 1;
  overflow: auto;
}

.modal-item-list {
  .item {
    &:not(:first-child) {
      margin-top: 10px;
    }
  }
}
</style>
