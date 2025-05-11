import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as path from 'path';
import { platform } from 'os';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// 윈도우 생성 함수
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // 필요하다면 preload.js 추가
      nodeIntegration: false,  // 보안을 위해 false로 설정
      contextIsolation: true,  // 보안을 위해 true로 설정
    }
  });

  // React 앱 로드 (React 빌드 파일 경로)
  mainWindow.loadURL('http://localhost:5173'); // 개발 서버 URL (또는 production 빌드 파일 경로)

  // 창이 닫혔을 때 처리
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 윈도우 크기 변경이나 기타 이벤트도 처리할 수 있습니다
  mainWindow.on('resize', () => {
    console.log('Window resized');
  });
}

// 애플리케이션 아이콘과 트레이 설정
function createTray() {
  tray = new Tray(path.join(__dirname, 'tray-icon.png'));  // 트레이 아이콘
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit', click: () => app.quit()
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('CoinTracker App');
}

// 메인 프로세스에서 IPC 통신 처리
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// 애플리케이션 준비 완료 후 창을 생성
app.whenReady().then(() => {
  createWindow();
  createTray();
});

// 모든 창이 닫히면 애플리케이션 종료
app.on('window-all-closed', () => {
  if (platform() !== 'darwin') {  // macOS에서는 앱이 종료되지 않도록 함
    app.quit();
  }
});

// macOS에서 창을 닫아도 애플리케이션을 종료하지 않도록
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 예시: 렌더러 프로세스에서 요청받은 데이터를 메인 프로세스에서 처리하고 반환
ipcMain.on('some-ipc-event', (event, arg) => {
  console.log(arg);  // 받은 인자 출력
  event.reply('some-ipc-response', '응답 내용');
});
