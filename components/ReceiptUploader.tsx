'use client';

import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

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
        <div className="relative group overflow-hidden border border-white/10 bg-slate-900/60 rounded-2xl aspect-video">
          <Image src={receiptUrl} alt="Receipt Preview" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
            {allowView && (
              <button
                type="button"
                onClick={() => window.open(receiptUrl, '_blank')}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-gold text-white hover:text-black flex items-center justify-center transition-all shadow-xl hover:scale-110"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="w-12 h-12 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-xl hover:scale-110"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-500 group overflow-hidden
          ${isDragging 
            ? 'border-gold bg-gold/10' 
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold/30'
          }`}
      >
        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={onChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4 text-gold">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Receipt...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 p-8 text-center relative z-10 transition-transform duration-500 group-hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/10 group-hover:bg-gold/10 group-hover:text-gold group-hover:border-gold/20 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                Drop Document <span className="text-slate-600 font-bold group-hover:text-gold/60">— or Click to Access</span>
              </p>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">PDF, PNG, JPG (MAX 5MB)</p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-in shake-in-1 duration-500">
          {error}
        </p>
      )}
    </div>
  );
}
