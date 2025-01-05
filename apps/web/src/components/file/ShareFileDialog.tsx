import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { shareFile, generateTemporaryLink } from '@/services/api/storage';

interface ShareFileDialogProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
  onShareComplete?: () => void;
}

export const ShareFileDialog: React.FC<ShareFileDialogProps> = ({
  fileId,
  isOpen,
  onClose,
  onShareComplete,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [expiresIn, setExpiresIn] = useState('24');
  const [temporaryLink, setTemporaryLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      await shareFile(fileId, {
        email,
        permission,
        expiresIn: parseInt(expiresIn) * 3600, // Convert hours to seconds
      });
      onShareComplete?.();
      setEmail('');
      setPermission('view');
    } catch (error) {
      console.error('Error sharing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
      const link = await generateTemporaryLink(fileId, {
        expiresIn: parseInt(expiresIn) * 3600,
      });
      setTemporaryLink(link);
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(temporaryLink);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share this file with others or generate a temporary link
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Share with user</h4>
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleShare} disabled={!email || isLoading}>
                Share
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Generate temporary link</h4>
            <div className="flex gap-2">
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateLink} disabled={isLoading}>
                Generate
              </Button>
            </div>
          </div>

          {temporaryLink && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Temporary Link</h4>
              <div className="flex gap-2">
                <Input value={temporaryLink} readOnly />
                <Button onClick={handleCopyLink}>Copy</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
