<template>
  <div>
    <a-button type="link" @click="handleClick">ssh-keygen</a-button>
    <a-modal v-model:open="visible" title="ssh-keygen" @ok="handleModalOk">
      <template #footer></template>
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="Filename"
          name="filename"
          :rules="[{ required: true, message: 'Please input your filename!' }]"
        >
          <a-input v-model:value="formState.filename">
            <template #prefix>
              <span>~/.ssh/</span>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="Comment" name="comment">
          <a-input v-model:value="formState.comment" placeholder="xxx@gmail.com" />
        </a-form-item>

        <a-form-item label="Password" name="password">
          <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">Submit</a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="visibleInfo" title="ssh-keygen result" cancel-text="关闭" @ok="handleModalOk2">
      <div>key:</div>
      <Codemirror :extensions="extensions" :modelValue="rsaInfo.key" style="height: 200px" />

      <div style="margin-top: 20px">pubKey:</div>
      <Codemirror :extensions="extensions" :modelValue="rsaInfo.pubKey" style="height: 60px; margin-top: 1px" />
      <CopyOutlined style="width: 20px; height: 20px; cursor: pointer" @click="handleCopyPubKey" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { CopyOutlined } from '@ant-design/icons-vue';
import { oneDark } from '@codemirror/theme-one-dark';
import { Codemirror } from 'vue-codemirror';

const visible = ref(false);
const visibleInfo = ref(false);

const rsaInfo = ref<any>({});

const handleClick = () => {
  visible.value = true;
};

const formState = reactive({
  filename: 'id_rsa_',
  comment: '',
  password: '',
});

const onFinish = async (values: any) => {
  console.log('Success:', values);
  try {
    const ret = await window.electronAPI.sshKeygen(values);
    console.log('ret', ret);
    message.success('ssh-keygen success');
    rsaInfo.value = ret;
    visible.value = false;
    visibleInfo.value = true;
  } catch (e: any) {
    console.log('e', e.message);
    message.error(e.message);
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const handleModalOk = () => {
  visible.value = false;
};

const handleModalOk2 = () => {
  visibleInfo.value = false;
};

const extensions = [oneDark];

const handleCopyPubKey = () => {
  copyTextToClipboard(rsaInfo.value.pubKey);
};

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      message.success('复制成功');
    },
    (err) => {
      message.error('复制失败' + err);
    },
  );
};
</script>
