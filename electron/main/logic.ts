const fs = require('fs');
const path = require('path');
const os = require('os');
const SSHConfig = require('ssh-config');

function getPath() {
  return path.join(os.homedir(), '.ssh', 'config');
}

export function init(ipcMain) {
  ipcMain.handle('ping', async (event, arg) => {
    // console.log('ping', event, arg);
    return arg + ' ' + 'pong';
  });

  ipcMain.handle('get-path', (event, arg) => {
    return getPath();
  });

  ipcMain.handle('get-list', (event, arg) => {
    const p = getPath();
    const content = fs.readFileSync(p, 'utf8');

    const config = SSHConfig.parse(content);

    return config;
  });
}
