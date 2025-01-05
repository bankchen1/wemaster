import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tree,
  Typography,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  UploadOutlined,
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import styles from './Materials.module.scss';

const { Title } = Typography;
const { DirectoryTree } = Tree;
const { Option } = Select;
const { TextArea } = Input;

interface Material {
  id: string;
  name: string;
  type: string;
  size: number;
  subject: string;
  uploadTime: string;
  downloads: number;
  shared: boolean;
  path: string;
}

interface Folder {
  key: string;
  title: string;
  children?: Folder[];
  isLeaf?: boolean;
}

export const TutorMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMaterials();
    fetchFolders();
  }, [currentPath]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tutor/materials?path=${currentPath}`);
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('获取资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/tutor/materials/folders');
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('获取文件夹结构失败:', error);
    }
  };

  const handleUpload = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('file', values.file[0].originFileObj);
      formData.append('subject', values.subject);
      formData.append('description', values.description);
      formData.append('path', currentPath);

      await fetch('/api/tutor/materials/upload', {
        method: 'POST',
        body: formData,
      });

      message.success('上传成功');
      setUploadModalVisible(false);
      fetchMaterials();
    } catch (error) {
      message.error('上传失败');
    }
  };

  const handleCreateFolder = async (values: any) => {
    try {
      await fetch('/api/tutor/materials/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          path: currentPath,
        }),
      });

      message.success('文件夹创建成功');
      setFolderModalVisible(false);
      fetchFolders();
      fetchMaterials();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tutor/materials/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      fetchMaterials();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      const response = await fetch(`/api/tutor/materials/${material.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error('下载失败');
    }
  };

  const handleShare = async (material: Material) => {
    try {
      const response = await fetch(`/api/tutor/materials/${material.id}/share`, {
        method: 'POST',
      });
      const data = await response.json();
      Modal.success({
        title: '分享链接',
        content: (
          <div>
            <p>链接已生成，有效期24小时：</p>
            <Input.TextArea
              value={data.shareUrl}
              readOnly
              autoSize
              onClick={e => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        ),
      });
    } catch (error) {
      message.error('生成分享链接失败');
    }
  };

  const onDirectoryTreeSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    if (info.node.key) {
      setCurrentPath(info.node.key as string);
    }
  };

  const columns: ColumnsType<Material> = [
    {
      title: '名称',
      key: 'name',
      render: (_, record) => (
        <Space>
          {record.type === 'folder' ? (
            <FolderOutlined />
          ) : (
            <FileOutlined />
          )}
          {record.name}
        </Space>
      ),
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: size => {
        const kb = size / 1024;
        if (kb < 1024) {
          return `${kb.toFixed(2)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
    },
    {
      title: '下载次数',
      dataIndex: 'downloads',
      key: 'downloads',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="下载">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: '确认删除',
                      content: '确定要删除这个文件吗？',
                      onOk: () => handleDelete(record.id),
                    });
                  },
                },
              ],
            }}
          >
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.materials}>
      <Row gutter={16}>
        <Col span={6}>
          <Card className={styles.folderTree}>
            <DirectoryTree
              defaultExpandAll
              treeData={folders}
              onSelect={onDirectoryTreeSelect}
            />
          </Card>
        </Col>

        <Col span={18}>
          <Card>
            <div className={styles.header}>
              <Title level={3}>课程资料</Title>
              <Space>
                <Button
                  icon={<FolderOutlined />}
                  onClick={() => setFolderModalVisible(true)}
                >
                  新建文件夹
                </Button>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  上传资料
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={materials}
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="上传资料"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="file"
            label="选择文件"
            rules={[{ required: true }]}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="subject"
            label="所属科目"
            rules={[{ required: true }]}
          >
            <Select>
              {subjects.map(subject => (
                <Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="资料说明"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                上传
              </Button>
              <Button onClick={() => setUploadModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建文件夹"
        open={folderModalVisible}
        onCancel={() => setFolderModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleCreateFolder}
        >
          <Form.Item
            name="name"
            label="文件夹名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => setFolderModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 模拟数据
const subjects = [
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  // ...其他科目
];
