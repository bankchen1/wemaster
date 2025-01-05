import React from 'react';
import {
  Download,
  Share2,
  Archive,
  Trash2,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface BatchOperationToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onDownload: () => void;
  onShare: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isAllSelected: boolean;
  totalItems: number;
}

export const BatchOperationToolbar: React.FC<BatchOperationToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onSelectAll,
  onDownload,
  onShare,
  onArchive,
  onDelete,
  isAllSelected,
  totalItems,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 border-r border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm">
            {selectedCount} of {totalItems} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onArchive}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive selected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete selected</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
