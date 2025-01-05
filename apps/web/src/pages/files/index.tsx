import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/file/FileUploader';
import { FileList } from '@/components/file/FileList';
import { ShareFileDialog } from '@/components/file/ShareFileDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileAccessLevel, FileCategory } from '@/types/file';
import {
  getUserFiles,
  getSharedFiles,
  downloadFile,
  archiveFile,
  deleteFile,
} from '@/services/api/storage';
import { useToast } from '@/components/ui/use-toast';

export default function FilesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-files');
  const [files, setFiles] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [category, setCategory] = useState<FileCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const [myFiles, shared] = await Promise.all([
        getUserFiles({ category: category || undefined }),
        getSharedFiles(),
      ]);
      setFiles(myFiles[0]);
      setSharedFiles(shared[0]);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [category]);

  const filteredFiles = (activeTab === 'my-files' ? files : sharedFiles).filter(
    file =>
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUploadComplete = () => {
    loadFiles();
    toast({
      title: 'Success',
      description: 'File uploaded successfully',
    });
  };

  const handleDownload = async (fileId: string) => {
    try {
      await downloadFile(fileId);
      toast({
        title: 'Success',
        description: 'File download started',
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleShare = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsShareDialogOpen(true);
  };

  const handleArchive = async (fileId: string) => {
    try {
      await archiveFile(fileId);
      loadFiles();
      toast({
        title: 'Success',
        description: 'File archived successfully',
      });
    } catch (error) {
      console.error('Error archiving file:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      loadFiles();
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Files</h1>
        <div className="flex items-center space-x-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {Object.values(FileCategory).map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-files">My Files</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>

        <TabsContent value="my-files" className="space-y-6">
          <FileUploader
            category={category as FileCategory}
            onUploadComplete={handleUploadComplete}
            onUploadError={error =>
              toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
              })
            }
          />
          <FileList
            files={filteredFiles}
            onDownload={handleDownload}
            onShare={handleShare}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onGenerateLink={handleShare}
          />
        </TabsContent>

        <TabsContent value="shared">
          <FileList
            files={filteredFiles}
            onDownload={handleDownload}
            onShare={handleShare}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onGenerateLink={handleShare}
          />
        </TabsContent>
      </Tabs>

      {selectedFileId && (
        <ShareFileDialog
          fileId={selectedFileId}
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false);
            setSelectedFileId(null);
          }}
          onShareComplete={() => {
            loadFiles();
            setIsShareDialogOpen(false);
            setSelectedFileId(null);
            toast({
              title: 'Success',
              description: 'File shared successfully',
            });
          }}
        />
      )}
    </div>
  );
}
