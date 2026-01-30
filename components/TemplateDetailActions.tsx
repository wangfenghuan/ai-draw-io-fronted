"use client"

import { Rocket } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateDiagramDialog } from "@/components/create-diagram-dialog"

interface TemplateDetailActionsProps {
    material: {
        id?: string
        name?: string
        diagramCode?: string
    }
}

export function TemplateDetailActions({ material }: TemplateDetailActionsProps) {
    const router = useRouter()
    const [createDialogVisible, setCreateDialogVisible] = useState(false)

    const handleCreateSuccess = (diagramId: string | number) => {
        router.push(`/diagram/edit/${diagramId}`)
    }

    return (
        <>
            <button
                onClick={() => setCreateDialogVisible(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
                <Rocket className="w-5 h-5" />
                立即使用此模板
            </button>

            <CreateDiagramDialog
                open={createDialogVisible}
                onOpenChange={setCreateDialogVisible}
                onSuccess={handleCreateSuccess}
                initialName={material.name ? `使用模板-${material.name}` : undefined}
                initialDiagramCode={material.diagramCode}
            />
        </>
    )
}
