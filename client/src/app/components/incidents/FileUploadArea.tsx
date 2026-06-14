import { Upload, X, FileText } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '../ui/button';

interface DroppedFile {
  name: string;
  size: number;
  type: string;
}

export function FileUploadArea({
  files,
  setFiles,
  dragging,
  setDragging,
}: {
  files: DroppedFile[];
  setFiles: (files: DroppedFile[]) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles([...files, ...dropped]);
  };

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-border hover:border-slate-300 hover:bg-muted/40'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Device logs, photos, MDR forms, lab reports · PDF, XLSX, DOCX, PNG · Max 50MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files || []).map((f) => ({
              name: f.name,
              size: f.size,
              type: f.type,
            }));
            setFiles([...files, ...picked]);
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/50 border border-border rounded-md px-3 py-2">
              <FileText size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground flex-1 truncate">
                {f.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(files.filter((_, j) => j !== i));
                }}
                className="h-auto p-0"
              >
                <X size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
