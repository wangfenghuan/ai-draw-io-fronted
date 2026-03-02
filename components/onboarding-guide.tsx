"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState, useCallback } from "react"
import {
    MousePointer2,
    GitBranch,
    Download,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react"

const ONBOARDING_STORAGE_KEY = "intellidraw-onboarding-completed"

interface OnboardingStep {
    id: string
    icon: React.ReactNode
    titleKey: string
    descKey: string
    animation: string
    color: string
}

export function OnboardingGuide() {
    const t = useTranslations("onboarding")
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    const steps: OnboardingStep[] = [
        {
            id: "drag",
            icon: <MousePointer2 className="w-6 h-6" />,
            titleKey: "dragTitle",
            descKey: "dragDesc",
            animation: "drag",
            color: "#1677ff",
        },
        {
            id: "connect",
            icon: <GitBranch className="w-6 h-6" />,
            titleKey: "connectTitle",
            descKey: "connectDesc",
            animation: "connect",
            color: "#52c41a",
        },
        {
            id: "export",
            icon: <Download className="w-6 h-6" />,
            titleKey: "exportTitle",
            descKey: "exportDesc",
            animation: "export",
            color: "#722ed1",
        },
    ]

    useEffect(() => {
        // Check if user has completed onboarding
        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (!completed) {
            // Small delay to let page load
            const timer = setTimeout(() => setIsOpen(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    }, [])

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        } else {
            handleClose()
        }
    }, [currentStep, steps.length, handleClose])

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }, [currentStep])

    const handleSkip = useCallback(() => {
        handleClose()
    }, [handleClose])

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose()
            } else if (e.key === "ArrowRight" || e.key === "Enter") {
                handleNext()
            } else if (e.key === "ArrowLeft") {
                handlePrev()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, handleClose, handleNext, handlePrev])

    if (!isOpen) return null

    const step = steps[currentStep]

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleSkip}
            />

            {/* Main Content */}
            <div
                className="relative w-full mx-4 max-w-lg"
                style={{
                    animation: "onboardingIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Card */}
                <div
                    className="rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 text-center">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                            style={{
                                background: `${step.color}20`,
                                color: step.color,
                            }}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {t("stepProgress", { current: currentStep + 1, total: steps.length })}
                            </span>
                        </div>
                    </div>

                    {/* Animation Area */}
                    <div className="px-6">
                        <div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                background: "rgba(0,0,0,0.3)",
                                height: "200px",
                            }}
                        >
                            {/* Drag Animation */}
                            {step.animation === "drag" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        {/* Grid background */}
                                        <div
                                            className="absolute inset-0 opacity-20"
                                            style={{
                                                backgroundImage: `
                                                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                                `,
                                                backgroundSize: "20px 20px",
                                            }}
                                        />
                                        {/* Shape 1 - Rectangle */}
                                        <div
                                            className="absolute w-16 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg"
                                            style={{
                                                background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                                                left: "20%",
                                                top: "30%",
                                                animation: "dragShape1 3s ease-in-out infinite",
                                            }}
                                        >
                                            <span className="opacity-70">拖拽</span>
                                        </div>
                                        {/* Shape 2 - Circle */}
                                        <div
                                            className="absolute w-14 h-14 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-lg"
                                            style={{
                                                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                                left: "60%",
                                                top: "20%",
                                                animation: "dragShape2 3s ease-in-out infinite 0.5s",
                                            }}
                                        >
                                            <span className="opacity-70">移动</span>
                                        </div>
                                        {/* Shape 3 - Diamond */}
                                        <div
                                            className="absolute w-12 h-12 flex items-center justify-center text-white text-xs font-medium shadow-lg"
                                            style={{
                                                background: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                                                left: "40%",
                                                top: "55%",
                                                transform: "rotate(45deg)",
                                                animation: "dragShape3 3s ease-in-out infinite 1s",
                                            }}
                                        >
                                            <span className="opacity-70" style={{ transform: "rotate(-45deg)" }}>放置</span>
                                        </div>
                                        {/* Cursor */}
                                        <div
                                            className="absolute"
                                            style={{
                                                animation: "cursorMove 3s ease-in-out infinite",
                                            }}
                                        >
                                            <MousePointer2
                                                className="w-6 h-6 text-white drop-shadow-lg"
                                                style={{ filter: "drop-shadow(0 0 4px rgba(22,119,255,0.8))" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Connect Animation */}
                            {step.animation === "connect" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        {/* Grid background */}
                                        <div
                                            className="absolute inset-0 opacity-20"
                                            style={{
                                                backgroundImage: `
                                                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                                `,
                                                backgroundSize: "20px 20px",
                                            }}
                                        />
                                        {/* Node 1 */}
                                        <div
                                            className="absolute w-14 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg"
                                            style={{
                                                background: "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                                                left: "15%",
                                                top: "40%",
                                            }}
                                        >
                                            A
                                        </div>
                                        {/* Node 2 */}
                                        <div
                                            className="absolute w-14 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg"
                                            style={{
                                                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                                right: "15%",
                                                top: "40%",
                                            }}
                                        >
                                            B
                                        </div>
                                        {/* Animated Connection Line */}
                                        <svg
                                            className="absolute inset-0 w-full h-full"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                        >
                                            {/* Connection line */}
                                            <line
                                                x1="28"
                                                y1="50"
                                                x2="72"
                                                y2="50"
                                                stroke="url(#connectGradient)"
                                                strokeWidth="0.5"
                                                strokeLinecap="round"
                                                style={{
                                                    strokeDasharray: "100",
                                                    strokeDashoffset: "100",
                                                    animation: "drawLine 2s ease-in-out infinite",
                                                }}
                                            />
                                            {/* Arrow */}
                                            <polygon
                                                points="72,48 76,50 72,52"
                                                fill="#52c41a"
                                                style={{
                                                    opacity: 0,
                                                    animation: "fadeInArrow 2s ease-in-out infinite 0.8s",
                                                }}
                                            />
                                            <defs>
                                                <linearGradient id="connectGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#1677ff" />
                                                    <stop offset="100%" stopColor="#52c41a" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {/* Connection dots */}
                                        <div
                                            className="absolute w-3 h-3 rounded-full"
                                            style={{
                                                background: "#1677ff",
                                                left: "calc(15% + 50px)",
                                                top: "calc(40% + 17px)",
                                                transform: "translate(-50%, -50%)",
                                                animation: "pulse 2s ease-in-out infinite",
                                            }}
                                        />
                                        <div
                                            className="absolute w-3 h-3 rounded-full"
                                            style={{
                                                background: "#52c41a",
                                                right: "calc(15% + 50px)",
                                                top: "calc(40% + 17px)",
                                                transform: "translate(50%, -50%)",
                                                animation: "pulse 2s ease-in-out infinite 0.5s",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Export Animation */}
                            {step.animation === "export" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        {/* Document representation */}
                                        <div
                                            className="absolute rounded-xl overflow-hidden"
                                            style={{
                                                width: "100px",
                                                height: "70px",
                                                left: "50%",
                                                top: "50%",
                                                transform: "translate(-50%, -50%)",
                                                background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            {/* Mini diagram */}
                                            <div className="absolute inset-2 flex items-center justify-center gap-1">
                                                <div
                                                    className="w-4 h-3 rounded"
                                                    style={{ background: "#1677ff" }}
                                                />
                                                <div
                                                    className="w-6 h-0.5"
                                                    style={{ background: "rgba(255,255,255,0.3)" }}
                                                />
                                                <div
                                                    className="w-4 h-3 rounded"
                                                    style={{ background: "#52c41a" }}
                                                />
                                            </div>
                                        </div>
                                        {/* Export arrows */}
                                        <div
                                            className="absolute flex flex-col items-center gap-2"
                                            style={{
                                                right: "20%",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                animation: "exportBounce 1.5s ease-in-out infinite",
                                            }}
                                        >
                                            <Download
                                                className="w-8 h-8 text-white"
                                                style={{ filter: "drop-shadow(0 0 8px rgba(114,46,209,0.6))" }}
                                            />
                                        </div>
                                        {/* Format labels */}
                                        {["PNG", "SVG", "PDF"].map((format, i) => (
                                            <div
                                                key={format}
                                                className="absolute px-2 py-1 rounded text-xs font-medium text-white"
                                                style={{
                                                    background: "rgba(114,46,209,0.3)",
                                                    border: "1px solid rgba(114,46,209,0.5)",
                                                    right: "8%",
                                                    top: `${25 + i * 25}%`,
                                                    animation: `formatSlide 2s ease-in-out infinite ${i * 0.2}s`,
                                                }}
                                            >
                                                {format}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 text-center">
                        <div
                            className="flex items-center justify-center gap-2 mb-2"
                            style={{ color: step.color }}
                        >
                            {step.icon}
                            <h3 className="text-xl font-bold text-white">
                                {t(step.titleKey)}
                            </h3>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                            {t(step.descKey)}
                        </p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex items-center justify-center gap-2 pb-4">
                        {steps.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => setCurrentStep(i)}
                                className="transition-all duration-300"
                                style={{
                                    width: i === currentStep ? "24px" : "8px",
                                    height: "8px",
                                    borderRadius: "4px",
                                    background: i === currentStep ? step.color : "rgba(255,255,255,0.2)",
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        <button
                            onClick={handleSkip}
                            className="text-white/50 hover:text-white/80 text-sm transition-colors"
                        >
                            {t("skip")}
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t("previous")}
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1 px-5 py-2 rounded-lg text-white font-medium transition-all text-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                                    boxShadow: `0 4px 16px ${step.color}40`,
                                }}
                            >
                                {currentStep === steps.length - 1 ? t("gotIt") : t("next")}
                                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Keyboard hint */}
                <div className="text-center mt-4 text-white/30 text-xs">
                    {t("keyboardHint")}
                </div>
            </div>

            <style>{`
                @keyframes onboardingIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                
                @keyframes dragShape1 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(30px, -20px); }
                    50% { transform: translate(60px, 10px); }
                    75% { transform: translate(20px, 30px); }
                }
                
                @keyframes dragShape2 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-40px, 20px); }
                    50% { transform: translate(-20px, -30px); }
                    75% { transform: translate(30px, -10px); }
                }
                
                @keyframes dragShape3 {
                    0%, 100% { transform: rotate(45deg) translate(0, 0); }
                    25% { transform: rotate(45deg) translate(-20px, 30px); }
                    50% { transform: rotate(45deg) translate(40px, -20px); }
                    75% { transform: rotate(45deg) translate(-30px, -40px); }
                }
                
                @keyframes cursorMove {
                    0% { left: 20%; top: 30%; }
                    25% { left: 50%; top: 15%; }
                    50% { left: 70%; top: 50%; }
                    75% { left: 35%; top: 70%; }
                    100% { left: 20%; top: 30%; }
                }
                
                @keyframes drawLine {
                    0% { stroke-dashoffset: 100; }
                    50%, 100% { stroke-dashoffset: 0; }
                }
                
                @keyframes fadeInArrow {
                    0%, 50% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.5; }
                }
                
                @keyframes exportBounce {
                    0%, 100% { transform: translateY(-50%) translateX(0); }
                    50% { transform: translateY(-50%) translateX(-10px); }
                }
                
                @keyframes formatSlide {
                    0%, 100% { opacity: 0; transform: translateX(20px); }
                    50% { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    )
}

// Hook to check if onboarding should be shown
export function useOnboardingStatus() {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        setShouldShowOnboarding(!completed)
        setIsLoading(false)
    }, [])

    const completeOnboarding = useCallback(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
        setShouldShowOnboarding(false)
    }, [])

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY)
        setShouldShowOnboarding(true)
    }, [])

    return { shouldShowOnboarding, isLoading, completeOnboarding, resetOnboarding }
}