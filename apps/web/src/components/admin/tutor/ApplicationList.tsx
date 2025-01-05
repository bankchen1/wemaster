import { useState, useEffect } from 'react';
import { ApplicationReview } from './ApplicationReview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { getTutorApplications } from '@/lib/api/admin';
import { ApplicationStatus } from '@/types/tutor';
import { cn } from '@/lib/utils';

export function ApplicationList() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const { toast } = useToast();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getTutorApplications();
      setApplications(data);
    } catch (error) {
      toast({
        title: '加载失败',
        description: '请刷新页面重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants = {
      [ApplicationStatus.PENDING]: 'default',
      [ApplicationStatus.APPROVED]: 'success',
      [ApplicationStatus.REJECTED]: 'destructive',
    };

    const labels = {
      [ApplicationStatus.PENDING]: '待审核',
      [ApplicationStatus.APPROVED]: '已通过',
      [ApplicationStatus.REJECTED]: '已拒绝',
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="搜索导师姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value={ApplicationStatus.PENDING}>待审核</SelectItem>
              <SelectItem value={ApplicationStatus.APPROVED}>已通过</SelectItem>
              <SelectItem value={ApplicationStatus.REJECTED}>已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={loadApplications}
          disabled={loading}
        >
          刷新
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>申请时间</TableHead>
              <TableHead>科目</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  暂无申请记录
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>
                    {format(new Date(app.createdAt), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {app.subjects.slice(0, 2).map((subject: string) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                      {app.subjects.length > 2 && (
                        <Badge variant="secondary">
                          +{app.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedApplication(app)}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={!!selectedApplication}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
      >
        <SheetContent side="right" className="w-[90vw] sm:max-w-[900px]">
          <SheetHeader>
            <SheetTitle>申请详情</SheetTitle>
          </SheetHeader>
          {selectedApplication && (
            <ApplicationReview
              application={selectedApplication}
              onReviewComplete={() => {
                setSelectedApplication(null);
                loadApplications();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
