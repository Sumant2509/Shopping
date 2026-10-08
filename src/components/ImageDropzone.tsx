'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  UploadCloud, 
  Trash2, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  Loader2, 
  Link as LinkIcon, 
  GripVertical, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from 'lucide-react';

interface ImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  label?: string;
  helperText?: string;
}

export function ImageDropzone({
  images,
  onChange,
  maxFiles = 10,
  label = 'Product Images & Gallery',
  helperText = 'Drag & drop photos directly from your computer, or click to browse files.',
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setErrorMessage(null);
      setSuccessMessage(null);
    }, 4000);
  };

  const uploadFiles = async (fileList: FileList | File[]) => {
    const validFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      showNotification('Please choose valid image files (JPG, PNG, WEBP, GIF, SVG).', true);
      return;
    }

    if (images.length + validFiles.length > maxFiles) {
      showNotification(`Maximum ${maxFiles} images allowed per product.`, true);
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload images');
      }

      const newUrls: string[] = data.urls;
      onChange([...images, ...newUrls]);
      showNotification(`Successfully added ${newUrls.length} image${newUrls.length > 1 ? 's' : ''}!`);
    } catch (err: any) {
      console.error('Upload error:', err);
      showNotification(err.message || 'Error uploading files. Please try again.', true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag and drop event handlers for main upload box
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  // Reorder items
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      showNotification('URL must begin with https://, http://, or /', true);
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
    showNotification('Image URL added to gallery.');
  };

  // Clipboard paste support (Ctrl+V)
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        await uploadFiles(files);
      }
    },
    [images]
  );

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-craft-900 uppercase tracking-wider">
            {label}
          </label>
          <p className="text-xs text-craft-500 mt-0.5">{helperText}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-craft-200/70 text-craft-700">
            {images.length} / {maxFiles} images
          </span>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-semibold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1 hover:underline"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL input' : 'Add by URL'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Optional URL Adder */}
      {showUrlInput && (
        <div className="p-4 bg-craft-50 rounded-2xl border border-craft-200 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Paste image URL (e.g. https://... or /images/hero_doormat.jpg)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-500 bg-white"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="bg-craft-800 hover:bg-craft-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </div>
      )}

      {/* MAIN DRAG & DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-terracotta-600 bg-terracotta-50/70 scale-[1.01] shadow-lg ring-4 ring-terracotta-100'
            : 'border-craft-300 hover:border-terracotta-500 hover:bg-amber-50/30 bg-craft-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-9 h-9 text-terracotta-600 animate-spin" />
            <p className="text-xs font-bold text-craft-900">Uploading your images to server...</p>
            <p className="text-[11px] text-craft-500">Please wait a moment while files are saved</p>
          </div>
        ) : (
          <>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-terracotta-600 text-white shadow-md scale-110'
                  : 'bg-white border border-craft-200 text-terracotta-700 shadow-sm'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-sm">
              <p className="text-xs sm:text-sm font-bold text-craft-900">
                {isDragging ? (
                  <span className="text-terracotta-700 font-extrabold text-sm sm:text-base">
                    Drop your images right here!
                  </span>
                ) : (
                  <span>
                    Drag & drop images here, or{' '}
                    <span className="text-terracotta-700 hover:underline">browse from device</span>
                  </span>
                )}
              </p>
              <p className="text-[11px] text-craft-500">
                Supports JPG, PNG, WEBP, GIF, SVG up to 15MB • Upload multiple photos at once
              </p>
              <p className="text-[10px] text-craft-400">
                💡 Tip: You can also press <kbd className="px-1.5 py-0.5 bg-craft-200/80 rounded font-mono">Ctrl+V</kbd> to paste images from clipboard
              </p>
            </div>
          </>
        )}
      </div>

      {/* GALLERY OF UPLOADED IMAGES */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-craft-600 pt-2">
            <span className="font-semibold text-craft-700">Uploaded Gallery ({images.length})</span>
            <span className="text-[11px] text-craft-400">
              Drag cards or use arrows (← →) to arrange order
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  draggable
                  onDragStart={() => setDraggedCardIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCardIndex !== null && draggedCardIndex !== index) {
                      moveImage(draggedCardIndex, index);
                      setDraggedCardIndex(null);
                    }
                  }}
                  className={`group relative rounded-2xl border overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col ${
                    isCover
                      ? 'border-terracotta-500 ring-2 ring-terracotta-200'
                      : 'border-craft-200 hover:border-craft-400'
                  }`}
                >
                  {/* Image Preview Thumbnail */}
                  <div className="relative aspect-square w-full bg-craft-100 overflow-hidden cursor-grab active:cursor-grabbing">
                    <img
                      src={imgUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback placeholder if image breaks
                        (e.target as HTMLImageElement).src = '/images/hero_doormat.jpg';
                      }}
                    />

                    {/* Cover badge */}
                    {isCover ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-terracotta-700 text-white text-[10px] font-bold shadow-md flex items-center gap-1 z-10">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Cover Photo</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCover(index)}
                        title="Set as Main Cover Photo"
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-craft-800 hover:text-terracotta-700 text-[10px] font-bold shadow-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 z-10"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Make Cover</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* View modal button */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl(imgUrl)}
                      title="View full image"
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all z-10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Controls below image */}
                  <div className="p-2 bg-craft-50/80 border-t border-craft-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-craft-500 truncate max-w-[80px]" title={imgUrl}>
                      #{index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, index - 1)}
                        title="Move Left"
                        className="p-1 rounded text-craft-600 hover:text-craft-900 hover:bg-craft-200 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, index + 1)}
                        title="Move Right"
                        className="p-1 rounded text-craft-600 hover:text-craft-900 hover:bg-craft-200 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
            <div className="p-2 text-center text-xs text-craft-600 truncate font-mono">
              {previewModalUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
