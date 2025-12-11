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

export {}
