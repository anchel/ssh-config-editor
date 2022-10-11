const fs = require('fs');
const path = require('path');
const os = require('os');
const SSHConfig = require('ssh-config');
const keygen = require('ssh-keygen-lite');
const readdirp = require('readdirp');

function getPath() {
  return path.join(os.homedir(), '.ssh', 'config');
}

function getList() {
  const p = getPath();
  const content = fs.readFileSync(p, 'utf8');

  const config = SSHConfig.parse(content);
  // console.log('config', config);
  return config;
}

function writeFile(str) {
  const p = getPath();
  fs.writeFileSync(p, str);
}

export function init(ipcMain) {
  ipcMain.handle('ping', async (event, arg) => {
    return SSHConfig.stringify(getList()[1].config);
  });

  ipcMain.handle('get-path', (event, arg) => {
    return getPath();
  });

  ipcMain.handle('get-list', (event, arg) => {
    return getList();
  });

  ipcMain.handle('delete-config', (event, list, item, idx) => {
    const config = getList();
    config.remove(line => line.param === item.param && line.value === item.value);
    writeFile(SSHConfig.stringify(config));
  });

  ipcMain.handle('add-config', (event, list, item, prepend = false) => {
    const config = getList();
    const jsonObj = {};
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

  ipcMain.handle('edit-config', (event, list, item, idx) => {
    // console.log('edit-config', item, idx);
    const config = getList();
    const findItem = config[idx];

    findItem.value = item.value; // assign Host
    findItem.config = item.config; // assign config

    writeFile(SSHConfig.stringify(config));
  });

  ipcMain.handle('ssh-keygen', (event, options) => {
    const basePath = path.join(os.homedir(), '.ssh');
    const finalPath = path.resolve(basePath, options.filename);
    console.log('basePath, finalPath', basePath, finalPath);
    if (fs.existsSync(finalPath)) {
      return Promise.reject('File already exists');
    }
    const params = {
      location: path.join(basePath, options.filename),
      type: 'rsa',
      read: true,
      force: true,
      destroy: false,
      comment: options.comment,
      password: options.password,
      size: '2048',
      format: 'PEM',
    };
    return new Promise((resolve, reject) => {
      keygen(params, (err, out) => {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      });
    });
  });

  ipcMain.handle('search-if', async (event, keyword) => {
    // console.log('search-if', keyword);
    const basePath = path.join(os.homedir(), '.ssh');
    const list = [];
    for await (const entry of readdirp(basePath, { fileFilter: '*id_rsa*' })) {
      const p = entry.path;
      // console.log(`${JSON.stringify({path})}`);
      list.push(path.join('~/.ssh', p).replace(/\\/g, '/'));
    }
    return list.filter(item => item.indexOf('.pub') === -1 && item.indexOf(keyword) !== -1).map(item => ({ value: item })).slice(0, 20);
  });
}
