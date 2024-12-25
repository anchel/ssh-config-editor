import { app, BrowserWindow, Menu } from 'electron';
import { getAutoUpdater } from './updater.ts';
import { getMainWindow } from './window-manager.ts';
import { send } from './sender.ts';

export function createMenu() {
  const isMac = process.platform === 'darwin';

  const template: Array<any> = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    // {
    //   label: 'File',
    //   submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    // },
    // { role: 'editMenu' }
    // {
    //   label: 'Edit',
    //   submenu: [
    //     { role: 'undo' },
    //     { role: 'redo' },
    //     { type: 'separator' },
    //     { role: 'cut' },
    //     { role: 'copy' },
    //     { role: 'paste' },
    //     ...(isMac
    //       ? [
    //           { role: 'pasteAndMatchStyle' },
    //           { role: 'delete' },
    //           { role: 'selectAll' },
    //           { type: 'separator' },
    //           {
    //             label: 'Speech',
    //             submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
    //           },
    //         ]
    //       : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    //   ],
    // },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            const autoUpdater = getAutoUpdater();
            send('show-message', { type: 'info', content: 'Checking for updates...' });
            autoUpdater.checkForUpdatesAndNotify().then(
              (ret) => {
                console.log('checkForUpdatesAndNotify', ret);
                send('check-update-result', ret);
              },
              (e) => {
                console.error(e);
                send('check-update-result', { error: e.message });
              },
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
