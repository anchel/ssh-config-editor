import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | undefined;

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win;
}

export function getMainWindow() {
  return mainWindow;
}
