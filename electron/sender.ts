import { getMainWindow } from './window-manager.ts';

export function send(ev: string, opts: any) {
  let win = getMainWindow();
  if (win) {
    win.webContents.send(ev, opts);
  }
}
