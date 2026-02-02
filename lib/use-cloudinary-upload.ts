import { useState } from 'react';

export interface UploadResponse {
  url: string;
  publicId: string;
}

export const useCloudinaryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    fileType: 'image' | 'video'
  ): Promise<UploadResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      return {
        url: data.url,
        publicId: data.publicId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (publicId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload?publicId=${publicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during deletion';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    deleteFile,
    loading,
    error,
    clearError: () => setError(null),
  };
};
