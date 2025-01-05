import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Image,
  Film,
  Music,
  File as FileIcon,
  Download,
  Share2,
  MoreVertical,
  Archive,
  Trash2,
  ExternalLink,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { FileAccessLevel, FileCategory } from '@/types/file';
import { BatchOperationToolbar } from './BatchOperationToolbar';
import { BatchShareDialog } from './BatchShareDialog';

interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    accessLevel: FileAccessLevel;
    category: FileCategory;
    downloads: number;
    createdAt: string;
    isArchived: boolean;
  }>;
  onDownload: (fileIds: string[]) => void;
  onShare: (fileIds: string[]) => void;
  onArchive: (fileIds: string[]) => void;
  onDelete: (fileIds: string[]) => void;
  onGenerateLink: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onShare,
  onArchive,
  onDelete,
  onGenerateLink,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleSelectFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
  };

  const handleBatchDownload = () => {
    onDownload(Array.from(selectedFiles));
  };

  const handleBatchShare = () => {
    setIsShareDialogOpen(true);
  };

  const handleBatchArchive = () => {
    onArchive(Array.from(selectedFiles));
  };

  const handleBatchDelete = () => {
    if (confirm('Are you sure you want to delete these files?')) {
      onDelete(Array.from(selectedFiles));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (mimeType.startsWith('video/')) return <Film className="h-6 w-6" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('text/')
    )
      return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <>
      <div className="space-y-2">
        {files.map(file => (
          <div
            key={file.id}
            className={`flex items-center justify-between p-4 rounded-lg border
              ${
                file.isArchived
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-primary/50'
              }`}
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-0"
                onClick={(e) => handleSelectFile(file.id, e)}
              >
                {selectedFiles.has(file.id) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              {getFileIcon(file.mimeType)}
              <div>
                <h4
                  className={`text-sm font-medium ${
                    file.isArchived ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {file.originalName}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                  <span>{file.downloads} downloads</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs
                      ${
                        file.accessLevel === FileAccessLevel.PUBLIC
                          ? 'bg-green-100 text-green-700'
                          : file.accessLevel === FileAccessLevel.SHARED
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {file.accessLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload([file.id])}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare([file.id])}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onGenerateLink(file.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Generate Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onArchive([file.id])}>
                    <Archive className="h-4 w-4 mr-2" />
                    {file.isArchived ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete([file.id])}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <BatchOperationToolbar
        selectedCount={selectedFiles.size}
        onClearSelection={() => setSelectedFiles(new Set())}
        onSelectAll={handleSelectAll}
        onDownload={handleBatchDownload}
        onShare={handleBatchShare}
        onArchive={handleBatchArchive}
        onDelete={handleBatchDelete}
        isAllSelected={selectedFiles.size === files.length}
        totalItems={files.length}
      />

      <BatchShareDialog
        fileIds={Array.from(selectedFiles)}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        onShareComplete={() => {
          setIsShareDialogOpen(false);
          setSelectedFiles(new Set());
        }}
      />
    </>
  );
};
