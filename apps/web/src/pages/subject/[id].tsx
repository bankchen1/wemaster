import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Tabs, List, Avatar, Tag, Button, Spin, Empty } from 'antd';
import { subjectApi } from '@/api/subject';
import { Subject, Tutor } from '@/types/models';

const { TabPane } = Tabs;

const SubjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [subject, setSubject] = useState<Subject>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSubjectDetail();
    }
  }, [id]);

  const fetchSubjectDetail = async () => {
    try {
      const [subjectData, tutorsData] = await Promise.all([
        subjectApi.getSubjectDetail(id as string),
        subjectApi.getSubjectTutors(id as string)
      ]);
      setSubject(subjectData);
      setTutors(tutorsData);
    } catch (error) {
      console.error('Failed to fetch subject detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorClick = (tutorId: string) => {
    router.push(\`/tutor/\${tutorId}\`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-6">
        <Empty description="科目不存在" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{subject.name}</h1>
            <div className="space-x-2">
              <Tag color="blue">Level {subject.level}</Tag>
              <Tag color="green">{subject.code}</Tag>
              {subject.parent && (
                <Tag color="orange">
                  上级科目: {subject.parent.name}
                </Tag>
              )}
            </div>
          </div>
          <Button type="primary" onClick={() => router.push('/search?subject=' + id)}>
            查找相关课程
          </Button>
        </div>
        <p className="text-gray-600">{subject.description}</p>
      </Card>

      <Card className="mt-6">
        <Tabs defaultActiveKey="tutors">
          <TabPane tab="相关导师" key="tutors">
            <List
              itemLayout="horizontal"
              dataSource={tutors}
              renderItem={tutor => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleTutorClick(tutor.id)}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={tutor.avatar} size={64} />}
                    title={<span className="font-semibold">{tutor.name}</span>}
                    description={
                      <div>
                        <p>{tutor.title}</p>
                        <div className="mt-2">
                          {tutor.tags?.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-500">
                      ¥{tutor.hourlyRate}/小时
                    </div>
                    <div className="text-sm text-gray-500">
                      {tutor.totalStudents}名学生
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane tab="子科目" key="children">
            {subject.children?.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={subject.children}
                renderItem={child => (
                  <List.Item>
                    <Card
                      hoverable
                      onClick={() => router.push(\`/subject/\${child.id}\`)}
                    >
                      <Card.Meta
                        title={child.name}
                        description={child.description}
                      />
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无子科目" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SubjectDetailPage;
