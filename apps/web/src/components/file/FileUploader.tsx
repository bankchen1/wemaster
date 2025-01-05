import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { FileAccessLevel, FileCategory } from '@/types/file';
import { uploadFile } from '@/services/api/storage';

interface FileUploaderProps {
  courseId?: string;
  category?: FileCategory;
  accessLevel?: FileAccessLevel;
  onUploadComplete?: (file: any) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  courseId,
  category = FileCategory.OTHER,
  accessLevel = FileAccessLevel.PRIVATE,
  onUploadComplete,
  onUploadError,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes,
  multiple = false,
}) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>(
    {},
  );
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          // Initialize progress
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

          const formData = new FormData();
          formData.append('file', file);
          if (courseId) formData.append('courseId', courseId);
          formData.append('category', category);
          formData.append('accessLevel', accessLevel);

          const uploadedFile = await uploadFile(formData, {
            onUploadProgress: (progressEvent: any) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress,
              }));
            },
          });

          // Clear progress and error on success
          setUploadProgress(prev => {
            const { [file.name]: removed, ...rest } = prev;
            return rest;
          });
          setUploadErrors(prev => {
            const { [file.name]: removed, ...rest } = prev;
            return rest;
          });

          onUploadComplete?.(uploadedFile);
        } catch (error: any) {
          setUploadErrors(prev => ({
            ...prev,
            [file.name]: error.message || 'Upload failed',
          }));
          onUploadError?.(error);
        }
      }
    },
    [courseId, category, accessLevel, onUploadComplete, onUploadError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes?.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {},
    ),
    multiple,
  });

  const removeFile = (fileName: string) => {
    setUploadProgress(prev => {
      const { [fileName]: removed, ...rest } = prev;
      return rest;
    });
    setUploadErrors(prev => {
      const { [fileName]: removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {acceptedTypes
            ? `Accepted file types: ${acceptedTypes.join(', ')}`
            : 'All file types accepted'}
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>

      {/* Upload Progress */}
      <div className="mt-4 space-y-3">
        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => removeFile(fileName)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ))}
      </div>

      {/* Upload Errors */}
      <div className="mt-4 space-y-2">
        {Object.entries(uploadErrors).map(([fileName, error]) => (
          <div
            key={fileName}
            className="flex items-center justify-between p-2 bg-red-50 text-red-700 rounded"
          >
            <span className="text-sm">
              {fileName}: {error}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-700"
              onClick={() => removeFile(fileName)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
