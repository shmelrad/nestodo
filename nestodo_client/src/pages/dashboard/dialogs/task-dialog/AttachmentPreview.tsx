import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { isImage } from "@/lib/utils"
import { Attachment } from "@/types/attachment"
import { attachmentsApi } from "@/lib/api/attachments"

interface AttachmentPreviewProps {
    previewAttachment: Attachment | null
    setPreviewAttachment: (attachment: Attachment | null) => void
}

function AttachmentPreview({ previewAttachment, setPreviewAttachment }: AttachmentPreviewProps) {
    const isAttachmentImage = previewAttachment && isImage(previewAttachment.contentType)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const imageUrlRef = useRef<string | null>(null)

    useEffect(() => {
        if (isAttachmentImage) {
            const loadImage = async () => {
                try {
                    const blob = await attachmentsApi.getAttachmentBlob(previewAttachment.id)
                    const url = URL.createObjectURL(blob)
                    imageUrlRef.current = url
                    setImageUrl(url)
                } catch (error) {
                    console.error("Failed to load image:", error)
                }
            }
            loadImage()
        }
        
        return () => {
            if (imageUrlRef.current) {
                URL.revokeObjectURL(imageUrlRef.current)
                imageUrlRef.current = null
                setImageUrl(null)
            }
        }
    }, [previewAttachment, isAttachmentImage])

    return (
        <Dialog open={!!previewAttachment} onOpenChange={(open) => !open && setPreviewAttachment(null)}>
            <DialogContent className="sm:max-w-3xl flex flex-col items-center">
                <DialogTitle className="text-center mb-4">
                    {previewAttachment?.originalFileName}
                </DialogTitle>
                {previewAttachment && (
                    <div className="max-h-[70vh] overflow-hidden">
                        {isAttachmentImage ? (
                            imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={previewAttachment.originalFileName}
                                    className="max-w-full max-h-[70vh] object-contain rounded-md"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-[50vh] w-full">
                                    <p className="text-muted-foreground">Loading image...</p>
                                </div>
                            )
                        ) : (
                            <p className="text-center text-muted-foreground">We don't support this file type yet.</p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AttachmentPreview