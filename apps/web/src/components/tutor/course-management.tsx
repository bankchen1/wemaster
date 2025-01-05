import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Users, Book, Plus, Edit2, Trash2 } from 'lucide-react'

export function CourseManagement({ tutorId }: { tutorId: string }) {
  const [selectedCourse, setSelectedCourse] = useState<string>()

  // TODO: 从API获取课程数据
  const courses = {
    regular: [
      {
        id: '1',
        name: '商务英语口语进阶',
        type: 'regular',
        price: 200,
        duration: 60,
        maxStudents: 1,
        description: '面向职场人士的商务英语口语课程，提升商务沟通能力。',
        syllabus: [
          '商务会议用语',
          '谈判技巧',
          '演讲技巧',
          '邮件写作',
        ],
        materials: [
          { name: '课程讲义.pdf', size: '2.5MB' },
          { name: '练习题.docx', size: '1.2MB' },
        ]
      },
      {
        id: '2',
        name: '雅思口语备考',
        type: 'regular',
        price: 250,
        duration: 60,
        maxStudents: 1,
        description: '针对雅思口语考试的专项训练课程。',
        syllabus: [
          'Part 1应答技巧',
          'Part 2演讲技巧',
          'Part 3讨论技巧',
          '评分标准解析',
        ],
        materials: [
          { name: '真题解析.pdf', size: '3.1MB' },
          { name: '词汇表.xlsx', size: '0.8MB' },
        ]
      }
    ],
    group: [
      {
        id: '3',
        name: '商务英语小组课',
        type: 'group',
        price: 100,
        duration: 90,
        maxStudents: 6,
        description: '小组形式的商务英语课程，通过互动提升口语能力。',
        syllabus: [
          '商务场景对话',
          '案例分析讨论',
          '角色扮演练习',
          '小组展示',
        ],
        materials: [
          { name: '课程大纲.pdf', size: '1.8MB' },
          { name: '案例材料.pdf', size: '2.3MB' },
        ]
      }
    ]
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">课程管理</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建课程
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新建课程</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">课程名称</label>
                  <Input placeholder="输入课程名称" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">课程类型</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择课程类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">一对一课程</SelectItem>
                      <SelectItem value="group">小组课程</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">课程时长（分钟）</label>
                  <Input type="number" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">课程价格（元）</label>
                  <Input type="number" placeholder="200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">最大学生数</label>
                  <Input type="number" placeholder="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">课程状态</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">上架</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">课程简介</label>
                <Textarea placeholder="输入课程简介" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">课程大纲</label>
                <Textarea placeholder="输入课程大纲，每行一个主题" />
              </div>
              <Button className="w-full">创建课程</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="regular">
        <TabsList className="mb-6">
          <TabsTrigger value="regular">一对一课程</TabsTrigger>
          <TabsTrigger value="group">小组课程</TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <div className="space-y-4">
            {courses.regular.map((course) => (
              <Card
                key={course.id}
                className={cn(
                  'p-4 cursor-pointer hover:border-primary transition-colors',
                  selectedCourse === course.id && 'border-primary'
                )}
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}分钟
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.maxStudents}人
                      </span>
                      <span className="font-medium">¥{course.price}/课时</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedCourse === course.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">课程大纲</h4>
                      <ul className="space-y-2">
                        {course.syllabus.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Book className="h-4 w-4" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">课程资料</h4>
                      <ul className="space-y-2">
                        {course.materials.map((material, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-primary">{material.name}</span>
                            <span className="text-muted-foreground">
                              {material.size}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="group">
          <div className="space-y-4">
            {courses.group.map((course) => (
              <Card
                key={course.id}
                className={cn(
                  'p-4 cursor-pointer hover:border-primary transition-colors',
                  selectedCourse === course.id && 'border-primary'
                )}
                onClick={() => setSelectedCourse(course.id)}
              >
                {/* 与一对一课程相同的渲染逻辑 */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
