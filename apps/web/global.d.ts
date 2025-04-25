/* eslint-disable @typescript-eslint/no-explicit-any */
// global.d.ts
/// <reference types="@ghost-web/lib" />

interface AppInfo {
  version: string;
  commitId: string;
}

interface Window {
  electron: {
    ipcRenderer: {
      send: (channel: string, ...args: unknown[]) => void;
      removeListener(channel: string, listener: (...args: any[]) => void): this;
      removeAllListeners(channel: string): this;
      on(channel: string, listener: IpcRendererListener): () => void;
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  };
  api?: {
    openExternal: (url: string) => void;
    onJarvisPostMessageSynchronous: (message) => void;
    removeJarvisPostMessageSynchronous: () => void;
  };
  __appInfo: AppInfo;
  __rendererPublicDir: string;
  zutron: NamedHandlers<AnyState, string>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  waker: {
    getState: () => Promise<WakerCommonRes<CurrentDeviceState>>;
    onConnect(cb: (data: WakerCommonRes<CurrentDeviceState>) => void): () => void;
    getWiFiList(): Promise<WakerCommonRes>;
    connectWiFi(ssid: string, capabilities: string, password?: string): Promise<WakerCommonRes>;
    getSavedWifiList(): Promise<WakerCommonRes>;
    delSavedWifi(ssid: string): Promise<WakerCommonRes>;
    ota(file: ArrayBuffer): Promise<WakerCommonRes>;
    otaProgress(
      cb: (data: WakerCommonRes<{ step: string; progress: number; desc: string }>) => void
    ): () => void;
  };
  browserWindowName: string | null;
}

declare module "browser-md5-file";
