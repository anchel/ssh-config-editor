import { message } from 'ant-design-vue';

function on(channel: string, listener: (event: any, ...args: any[]) => void) {
  return window.ipcRenderer.on(channel, listener);
}

export function registerInit() {
  on('show-message', async (_, opts: any) => {
    console.log('show-message', opts);
    message.open(opts);
  });

  on('check-update-result', async (_, ret: any) => {
    console.log('check-update-result', ret);
  });
}
