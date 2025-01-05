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
import { shareFiles } from '@/services/api/storage';

interface BatchShareDialogProps {
  fileIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onShareComplete?: () => void;
}

export const BatchShareDialog: React.FC<BatchShareDialogProps> = ({
  fileIds,
  isOpen,
  onClose,
  onShareComplete,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [expiresIn, setExpiresIn] = useState('24');
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      await shareFiles(fileIds, {
        email,
        permission,
        expiresIn: parseInt(expiresIn) * 3600, // Convert hours to seconds
      });
      onShareComplete?.();
      onClose();
      setEmail('');
      setPermission('view');
    } catch (error) {
      console.error('Error sharing files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Files</DialogTitle>
          <DialogDescription>
            Share {fileIds.length} selected files with others
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
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                  <SelectItem value="0">No expiration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!email || isLoading}
            >
              Share Files
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
