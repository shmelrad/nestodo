import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Attachment } from "@/types/attachment"
import { toast } from "sonner"
import { displayApiError, isImage } from "@/lib/utils"
import { attachmentsApi } from "@/lib/api/attachments"
import { ApiError } from "@/lib/api/base"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, Download, File, FileImage, Plus, Trash2 } from "lucide-react"
import prettyBytes from 'pretty-bytes';
import AttachmentPreview from "./AttachmentPreview"

interface AttachmentsListProps {
    attachments: Attachment[]
    taskId: number
    boardId: number
}

export default function AttachmentsList({ attachments, taskId, boardId }: AttachmentsListProps) {
    const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(true)
    const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
    const queryClient = useQueryClient()

    const uploadAttachmentMutation = useMutation({
        mutationFn: (file: File) => attachmentsApi.uploadFile(file, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("File uploaded successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to upload file", error)
        },
    })

    const deleteAttachmentMutation = useMutation({
        mutationFn: (id: number) => attachmentsApi.deleteAttachment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] })
            toast.success("File deleted successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to delete file", error)
        },
    })

    const downloadAttachmentMutation = useMutation({
        mutationFn: (id: number) => attachmentsApi.downloadAttachment(id),
        onSuccess: () => {
            toast.success("File downloaded successfully")
        },
        onError: (error: ApiError) => {
            displayApiError("Failed to download file", error)
        },
    })

    const handleUploadClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            if (target.files && target.files.length > 0) {
                const file = target.files[0]
                const fiftyMb = 50 * 1024 * 1024
                if (file.size > fiftyMb) {
                    toast.error("File size must be less than 50MB")
                    return
                }
                uploadAttachmentMutation.mutate(file)
            }
        }
        input.click()
    }

    const handleDownload = async (id: number) => {
        downloadAttachmentMutation.mutate(id)
    }

    const handleDelete = (id: number) => {
        deleteAttachmentMutation.mutate(id)
    }

    return (
        <>
            <Collapsible open={isAttachmentsOpen} onOpenChange={setIsAttachmentsOpen}>
                <div className="flex items-center justify-between mb-2">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="!px-0 hover:bg-transparent">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isAttachmentsOpen ? "transform rotate-180" : ""}`} />
                            <span className="text-sm font-semibold ml-2">Files</span>
                            <span className="text-sm text-muted-foreground ml-2">
                                ({attachments.length})
                            </span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <div className="space-y-3">
                        {attachments.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No files attached
                            </div>
                        )}
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between p-2 rounded-md border group hover:bg-muted/50 cursor-pointer"
                                onClick={() => setPreviewAttachment(attachment)}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {isImage(attachment.contentType) ? (
                                        <FileImage className="h-5 w-5 text-blue-500 shrink-0" />
                                    ) : (
                                        <File className="h-5 w-5 text-gray-500 shrink-0" />
                                    )}

                                    <span className="text-sm truncate">
                                        {attachment.originalFileName}
                                    </span>

                                    <span className="text-sm text-muted-foreground mx-2 whitespace-nowrap">
                                        {prettyBytes(attachment.size)}
                                    </span>
                                </div>

                                <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDownload(attachment.id)
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(attachment.id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-2">
                            <Button
                                size="sm"
                                onClick={handleUploadClick}
                                disabled={uploadAttachmentMutation.isPending}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add file
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <AttachmentPreview
                previewAttachment={previewAttachment}
                setPreviewAttachment={setPreviewAttachment}
            />
        </>
    )
} 