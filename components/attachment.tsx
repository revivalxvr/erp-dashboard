import { ImagePlus, X } from "lucide-react"


interface AttachmentProps {
  image?: string 
  productName?: string
  onRemove?: () => void
  compact?: boolean
}
export function Attachment({
  image,
  productName,
  onRemove,
  compact = false,
}: {
  image?: string 
  productName?: string
  onRemove?: () => void
  compact?: boolean
}) {
  if (!image) {
    return (
      <div className="flex size-10 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <ImagePlus className="size-4" />
      </div>
    )
  }

  return (
    <div className="flex w-fit max-w-[220px] items-center gap-2.5 rounded-xl border bg-card p-1.5 pr-3">
      <img
        src={image} // Langsung gunakan string URL dari backend
        alt={productName || "Product Image"}
        className="size-10 shrink-0 rounded-lg object-cover"
      />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium">{productName || "Preview"}</p>
          {/* <p className="text-xs text-muted-foreground">ImageKit URL</p> */}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus gambar"
          className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}