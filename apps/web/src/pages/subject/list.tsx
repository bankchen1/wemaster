import React, { useEffect, useState } from 'react';
import { Card, Tree, Input, Empty, Spin } from 'antd';
import { useRouter } from 'next/router';
import { subjectApi } from '@/api/subject';
import { SubjectTreeNode } from '@/types/subject';

const { Search } = Input;

const SubjectListPage: React.FC = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectApi.getSubjectTree();
      setSubjects(data);
      // 默认展开一级科目
      const firstLevelKeys = data.map(item => item.key);
      setExpandedKeys(firstLevelKeys);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      // 如果搜索值不为空，展开所有节点
      const allKeys = getAllKeys(subjects);
      setExpandedKeys(allKeys);
    } else {
      // 如果搜索值为空，只展开一级节点
      const firstLevelKeys = subjects.map(item => item.key);
      setExpandedKeys(firstLevelKeys);
    }
  };

  const getAllKeys = (nodes: SubjectTreeNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const handleSelect = (selectedKeys: string[], info: any) => {
    const node = info.node;
    if (node.isLeaf) {
      router.push(\`/subject/\${node.key}\`);
    }
  };

  const loop = (data: SubjectTreeNode[]): SubjectTreeNode[] =>
    data.map(item => {
      const index = item.title.toLowerCase().indexOf(searchValue.toLowerCase());
      const beforeStr = item.title.substring(0, index);
      const afterStr = item.title.slice(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className="text-blue-500 font-bold">{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );

      if (item.children) {
        return {
          ...item,
          title,
          children: loop(item.children),
        };
      }

      return {
        ...item,
        title,
      };
    });

  const treeData = loop(subjects);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card title="科目列表">
        <div className="mb-4">
          <Search
            placeholder="搜索科目"
            allowClear
            enterButton
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>
        {subjects.length > 0 ? (
          <Tree
            showLine
            showIcon
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            onSelect={handleSelect}
            treeData={treeData}
          />
        ) : (
          <Empty description="暂无科目数据" />
        )}
      </Card>
    </div>
  );
};

export default SubjectListPage;
