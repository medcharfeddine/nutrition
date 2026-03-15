'use client';

import { useRef, useState } from 'react';

interface FileUploadProps {
  onSuccess: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
  type?: 'image' | 'video';
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
}

export default function FileUpload({
  onSuccess,
  onError,
  type = 'image',
  accept = type === 'video' ? 'video/*' : 'image/*',
  maxSize = type === 'video' ? 500 : 50,
  className = '',
  buttonText = type === 'video' ? 'Télécharger Vidéo' : 'Télécharger Image',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Get upload signature from backend
      const signatureRes = await fetch('/api/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: type === 'video' ? 'nutrition-app/videos' : 'nutrition-app/images',
          resource_type: type === 'video' ? 'video' : 'image',
        }),
      });

      if (!signatureRes.ok) {
        const errorData = await signatureRes.json();
        throw new Error(errorData.error || 'Impossible de generer la signature');
      }

      const { signature, timestamp, cloudName, publicId, apiKey } = await signatureRes.json();

      // Create FormData for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('resource_type', type === 'video' ? 'video' : 'image');
      formData.append('folder', type === 'video' ? 'nutrition-app/videos' : 'nutrition-app/images');
      formData.append('quality', 'auto:eco');
      formData.append('fetch_format', 'auto');

      // Upload directly to Cloudinary
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type === 'video' ? 'video' : 'image'}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error?.message || 'Erreur lors du telechargement');
      }

      const result = await uploadRes.json();
      onSuccess(result.secure_url, result.public_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedTypes = type === 'video' ? validVideoTypes : validImageTypes;

    if (!allowedTypes.includes(file.type)) {
      const message = `Type de fichier invalide. Accepte: ${type === 'video' ? 'MP4, WebM, MOV' : 'JPEG, PNG, GIF, WebP'}`;
      setError(message);
      if (onError) onError(message);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const message = `Fichier trop volumineux. Max: ${maxSize}MB`;
      setError(message);
      if (onError) onError(message);
      return;
    }

    await uploadToCloudinary(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-2">
          {loading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">Telechargement en cours...</p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                {type === 'video' ? (
                  <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30v-8l10 0v8H20z" />
                ) : (
                  <path d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8zm0 0V4m0 4h8" />
                )}
              </svg>
              <p className="text-gray-700 font-semibold">{buttonText}</p>
              <p className="text-sm text-gray-500">
                ou glissez-deposez votre fichier ici
              </p>
              <p className="text-xs text-gray-400">
                Max {maxSize}MB - {type === 'video' ? 'MP4, WebM, MOV' : 'JPEG, PNG, GIF, WebP'}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
