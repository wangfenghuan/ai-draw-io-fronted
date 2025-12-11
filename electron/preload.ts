import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron,
    },
    openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
})

declare global {
    interface Window {
        electronAPI: {
            platform: string
            versions: {
                node: () => string
                chrome: () => string
                electron: () => string
            }
            openExternal: (url: string) => Promise<void>
        }
    }
}
