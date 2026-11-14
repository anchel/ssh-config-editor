import fs from 'fs';
import path from 'path';
import os from 'os';
import SSHConfig from 'ssh-config';
import { execFile } from 'node:child_process';
import readdirp from 'readdirp';
import { mkdirp } from 'mkdirp';
import { getAutoUpdater } from './updater.ts';

function getPath() {
  return path.join(os.homedir(), '.ssh', 'config');
}

function ensureConfigFile() {
  const p = getPath();
  mkdirp.sync(path.dirname(p));
  fs.closeSync(fs.openSync(p, 'a', 0o600));
  return p;
}

function getList() {
  const p = ensureConfigFile();
  const content = fs.readFileSync(p, 'utf8');

  const config = SSHConfig.parse(content);
  // console.log('config', config);
  return config;
}

function writeFile(str: string) {
  const p = ensureConfigFile();
  fs.writeFileSync(p, str);
}

export function init(ipcMain: any) {
  ipcMain.handle('ping', async () => {
    const config: any = getList();
    return SSHConfig.stringify(config[0]);
  });

  ipcMain.handle('check-update', () => {
    const autoUpdater = getAutoUpdater();
    return autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.handle('get-path', () => {
    return getPath();
  });

  ipcMain.handle('get-list', () => {
    return getList();
  });

  ipcMain.handle('delete-config', (_: any, item: any) => {
    const config: any = getList();
    config.remove((line: any) => line.param === item.param && line.value === item.value);
    writeFile(SSHConfig.stringify(config));
  });

  ipcMain.handle('add-config', (_: any, item: any, prepend = false) => {
    const config = getList();
    const jsonObj: any = {};
    jsonObj[item.param] = item.value; // assign Host
    for (const conf of item.config || []) {
      jsonObj[conf.param] = conf.value;
    }
    if (prepend) {
      config.prepend(jsonObj);
    } else {
      config.append(jsonObj);
    }
    writeFile(SSHConfig.stringify(config));
  });

  ipcMain.handle('edit-config', (_: any, item: any, idx: number) => {
    // console.log('edit-config', item, idx);
    const config = getList();
    const findItem: any = config[idx];

    findItem.value = item.value; // assign Host
    findItem.config = item.config; // assign config

    writeFile(SSHConfig.stringify(config));
  });

  ipcMain.handle('ssh-keygen', async (_: any, options: any) => {
    const basePath = path.join(os.homedir(), '.ssh');
    mkdirp.sync(basePath);
    const finalPath = path.resolve(basePath, options.filename);
    console.log('basePath, finalPath', basePath, finalPath);
    if (fs.existsSync(finalPath) || fs.existsSync(`${finalPath}.pub`)) {
      throw new Error('File already exists');
    }
    await new Promise<void>((resolve, reject) => {
      execFile(
        'ssh-keygen',
        ['-q', '-t', 'ed25519', '-C', options.comment || '', '-f', finalPath, '-N', options.password || ''],
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
    return {
      key: fs.readFileSync(finalPath, 'utf8'),
      pubKey: fs.readFileSync(`${finalPath}.pub`, 'utf8'),
    };
  });

  ipcMain.handle('search-if', async (_: any, keyword: string) => {
    // console.log('search-if', keyword);
    const basePath = path.join(os.homedir(), '.ssh');
    const list = [];
    for await (const entry of readdirp(basePath, {
      fileFilter: (e) => {
        return e.path.includes('id_rsa') || e.path.includes('id_ed25519');
      },
    })) {
      const p = entry.path;
      // console.log(`${JSON.stringify({path})}`);
      list.push(path.join('~/.ssh', p).replace(/\\/g, '/'));
    }
    return list
      .filter((item) => item.indexOf('.pub') === -1 && item.indexOf(keyword) !== -1)
      .map((item) => ({ value: item }))
      .slice(0, 20);
  });
}
