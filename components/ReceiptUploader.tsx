'use client';

import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ReceiptUploaderProps {
  receiptUrl: string;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
  allowView?: boolean;
}

export default function ReceiptUploader({ receiptUrl, onUploadSuccess, onRemove, allowView = true }: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  const handleFile = async (file: File) => {
    setError('');
    
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, PNG, or JPG files are allowed');
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await axios.post('/api/upload', data);
      onUploadSuccess(response.data.url);
    } catch {
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    // Reset input so the same file could be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async () => {
    onRemove();
  };

  // View state if receipt exists
  if (receiptUrl) {
    return (
      <div className="space-y-4">
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video">
          <Image src={receiptUrl} alt="Receipt Preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            {allowView && (
              <button
                type="button"
                onClick={() => window.open(receiptUrl, '_blank')}
                className="p-2 bg-white rounded-xl text-slate-950 hover:bg-amber-100 transition-colors shadow-lg"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-rose-500 rounded-xl text-white hover:bg-rose-600 transition-colors shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload state
  return (
    <div className="space-y-2">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 
          ${isDragging 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-white/10 bg-slate-950 hover:bg-slate-900 hover:border-amber-500/50'
          }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={onChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 text-amber-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
            <div className="p-3 bg-slate-800 rounded-full text-slate-300">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">
                Click to upload <span className="text-slate-500 font-normal">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-500">PDF, PNG, JPG or JPEG allowed</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-rose-500 text-xs font-semibold text-center">{error}</p>}
    </div>
  );
}
