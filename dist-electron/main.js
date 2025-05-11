"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// frontend/src/main.ts
var import_electron = require("electron");
var path = __toESM(require("path"), 1);
var import_os = require("os");
var mainWindow = null;
var tray = null;
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // 필요하다면 preload.js 추가
      nodeIntegration: false,
      // 보안을 위해 false로 설정
      contextIsolation: true
      // 보안을 위해 true로 설정
    }
  });
  mainWindow.loadURL("http://localhost:5173");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("resize", () => {
    console.log("Window resized");
  });
}
function createTray() {
  tray = new import_electron.Tray(path.join(__dirname, "tray-icon.png"));
  const contextMenu = import_electron.Menu.buildFromTemplate([
    {
      label: "Quit",
      click: () => import_electron.app.quit()
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("CoinTracker App");
}
import_electron.ipcMain.handle("get-app-version", () => {
  return import_electron.app.getVersion();
});
import_electron.app.whenReady().then(() => {
  createWindow();
  createTray();
});
import_electron.app.on("window-all-closed", () => {
  if ((0, import_os.platform)() !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (import_electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
import_electron.ipcMain.on("some-ipc-event", (event, arg) => {
  console.log(arg);
  event.reply("some-ipc-response", "\uC751\uB2F5 \uB0B4\uC6A9");
});
