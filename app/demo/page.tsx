"use client"

import { useEffect, useRef, useState } from "react"
import { DrawIoEmbed } from "react-drawio"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { LoginGateDialog } from "@/components/login-gate-dialog"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useDiagram } from "@/contexts/diagram-context"

import DemoChatPanel from "@/components/demo-chat-panel"

const drawioBaseUrl =
    process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://embed.diagrams.net"

export default function DemoPage() {
    const {
        drawioRef,
        handleDiagramExport,
        handleAutoSave,
        onDrawioLoad,
        resetDrawioReady,
    } = useDiagram()

    const [isMobile, setIsMobile] = useState(false)
    const [isChatVisible, setIsChatVisible] = useState(true)
    const [drawioUi, setDrawioUi] = useState<"min" | "sketch">("min")
    const [darkMode, setDarkMode] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [loginGateOpen, setLoginGateOpen] = useState(false)
    const [loginFeature, setLoginFeature] = useState("")

    const chatPanelRef = useRef<ImperativePanelHandle>(null)

    useEffect(() => {
        const savedUi = localStorage.getItem("drawio-theme")
        if (savedUi === "min" || savedUi === "sketch") {
            setDrawioUi(savedUi)
        }

        const savedDarkMode = localStorage.getItem("next-ai-draw-io-dark-mode")
        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === "true"
            setDarkMode(isDark)
            document.documentElement.classList.toggle("dark", isDark)
        } else {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches
            setDarkMode(prefersDark)
            document.documentElement.classList.toggle("dark", prefersDark)
        }

        setIsLoaded(true)
    }, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const toggleChatPanel = () => {
        const panel = chatPanelRef.current
        if (panel) {
            if (panel.isCollapsed()) {
                panel.expand()
                setIsChatVisible(true)
            } else {
                panel.collapse()
                setIsChatVisible(false)
            }
        }
    }

    const requireLogin = (featureName: string) => {
        setLoginFeature(featureName)
        setLoginGateOpen(true)
    }

    const toggleDarkMode = () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        localStorage.setItem("next-ai-draw-io-dark-mode", String(newValue))
        document.documentElement.classList.toggle("dark", newValue)
        resetDrawioReady()
    }

    return (
        <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-50 p-3 flex flex-col">
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-2xl rounded-2xl border border-white/10 transition-all duration-300 flex flex-col">
                <ResizablePanelGroup
                    id="main-panel-group"
                    direction={isMobile ? "vertical" : "horizontal"}
                    className="w-full flex-1 overflow-hidden"
                >
                    {/* Draw.io Canvas */}
                    <ResizablePanel
                        id="drawio-panel"
                        defaultSize={isMobile ? 50 : 67}
                        minSize={20}
                    >
                        <div className="w-full h-full relative bg-white rounded-bl-2xl overflow-hidden">
                            {isLoaded ? (
                                <DrawIoEmbed
                                    key={`${drawioUi}-${darkMode}`}
                                    ref={drawioRef}
                                    onExport={handleDiagramExport}
                                    onLoad={onDrawioLoad}
                                    onAutoSave={handleAutoSave}
                                    autosave={true}
                                    baseUrl={drawioBaseUrl}
                                    urlParameters={{
                                        ui: drawioUi,
                                        spin: true,
                                        libraries: false,
                                        saveAndExit: false,
                                        noExitBtn: true,
                                        dark: darkMode,
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle
                        withHandle
                        className="bg-white/10 hover:bg-white/20 transition-colors"
                    />

                    {/* Demo Chat/Upload Panel */}
                    <ResizablePanel
                    id="chat-panel"
                    ref={chatPanelRef}
                    defaultSize={isMobile ? 50 : 33}
                    minSize={isMobile ? 20 : 15}
                    maxSize={isMobile ? 80 : 50}
                    collapsible={!isMobile}
                    collapsedSize={isMobile ? 0 : 3}
                    onCollapse={() => setIsChatVisible(false)}
                    onExpand={() => setIsChatVisible(true)}
                >
                    <div className="h-full w-full overflow-hidden">
                        <DemoChatPanel
                            isVisible={isChatVisible}
                            onToggleVisibility={toggleChatPanel}
                            darkMode={darkMode}
                            isMobile={isMobile}
                            onRequireLogin={requireLogin}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            </div>

            <LoginGateDialog
                open={loginGateOpen}
                onOpenChange={setLoginGateOpen}
                featureName={loginFeature}
            />
        </div>
    )
}
