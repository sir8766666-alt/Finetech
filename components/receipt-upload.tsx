"use client";

import { useState, useRef } from "react";
import { Upload, LinkIcon, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReceiptUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ReceiptUpload({ value, onChange }: ReceiptUploadProps) {
  const [mode, setMode] = useState<"upload" | "link">("link");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error } = await supabase.storage
      .from("receipts")
      .upload(filePath, file);

    if (error) {
      setUploadError(error.message || "Upload failed");
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(filePath);
      onChange(publicUrl);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "link" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("link")}
        >
          <LinkIcon className="h-4 w-4 mr-1" />
          Paste Link
        </Button>
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload File
        </Button>
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {mode === "link" ? (
        <Input
          placeholder="https://example.com/receipt.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          {value ? (
            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 underline truncate max-w-[200px]"
              >
                Receipt uploaded
              </a>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
