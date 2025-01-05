import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getPendingProfiles, batchVerifyProfiles } from '@/lib/api/admin';

export function BatchReviewPanel() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 获取待审核列表
  const { data, isLoading } = useQuery(
    ['pendingProfiles', page, search, subjects],
    () => getPendingProfiles({ page, search, subjects }),
    {
      keepPreviousData: true,
    }
  );

  // 批量审核操作
  const batchReviewMutation = useMutation(
    ({ ids, action, reason }: any) => batchVerifyProfiles(ids, action, reason),
    {
      onSuccess: (result) => {
        toast({
          title: '批量处理完成',
          description: `成功：${result.success}，失败：${result.failure}`,
        });
        queryClient.invalidateQueries(['pendingProfiles']);
        setSelectedIds([]);
        setReviewDialog(false);
      },
      onError: () => {
        toast({
          title: '操作失败',
          description: '请稍后重试',
          variant: 'destructive',
        });
      },
    }
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.profiles.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleBatchAction = (action: 'approve' | 'reject') => {
    setAction(action);
    setReviewDialog(true);
  };

  const handleConfirmBatchAction = () => {
    batchReviewMutation.mutate({
      ids: selectedIds,
      action,
      reason: action === 'reject' ? reason : undefined,
    });
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="搜索导师姓名或简介"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            value={subjects.join(',')}
            onValueChange={(value) => setSubjects(value.split(','))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择科目" />
            </SelectTrigger>
            <SelectContent>
              {/* 这里需要从API获取科目列表 */}
              <SelectItem value="math">数学</SelectItem>
              <SelectItem value="english">英语</SelectItem>
              <SelectItem value="physics">物理</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => handleBatchAction('reject')}
            disabled={selectedIds.length === 0}
          >
            批量拒绝
          </Button>
          <Button
            onClick={() => handleBatchAction('approve')}
            disabled={selectedIds.length === 0}
          >
            批量通过
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    data?.profiles.length === selectedIds.length &&
                    selectedIds.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>导师信息</TableHead>
              <TableHead>科目</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(profile.id)}
                    onCheckedChange={(checked) =>
                      handleSelect(profile.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{profile.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {profile.subjects.map((subject) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(profile.createdAt), 'yyyy-MM-dd HH:mm', {
                    locale: zhCN,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIds([profile.id]);
                        setAction('reject');
                        setReviewDialog(true);
                      }}
                    >
                      拒绝
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedIds([profile.id]);
                        setAction('approve');
                        setReviewDialog(true);
                      }}
                    >
                      通过
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {data?.total} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={
              !data || page >= Math.ceil(data.total / data.limit)
            }
          >
            下一页
          </Button>
        </div>
      </div>

      {/* 审核确认对话框 */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? '批量通过审核' : '批量拒绝审核'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? '确认通过所选导师的资料审核？'
                : '请填写拒绝原因，我们会通知相关导师。'}
            </DialogDescription>
          </DialogHeader>

          {action === 'reject' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>拒绝原因</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请填写拒绝原因"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmBatchAction}
              disabled={action === 'reject' && !reason}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
