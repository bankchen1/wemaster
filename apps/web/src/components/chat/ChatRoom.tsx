import React, { useEffect, useState } from 'react';
import { sdk } from '@/lib/matrix'; // Matrix SDK 实例
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  Send,
  File,
  Image as ImageIcon,
  MoreVertical,
  UserPlus,
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}

interface ChatRoomProps {
  roomId: string;
  userId: string;
  isGroupChat?: boolean;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  userId,
  isGroupChat = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 初始化 Matrix 客户端
    initMatrixClient();
    // 加载历史消息
    loadMessages();
    // 监听新消息
    listenToNewMessages();

    return () => {
      // 清理监听器
      cleanup();
    };
  }, [roomId]);

  const initMatrixClient = async () => {
    try {
      await sdk.initCrypto();
      await sdk.startClient();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize chat',
        variant: 'destructive',
      });
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const room = sdk.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // 获取历史消息
      const timeline = await room.getTimeline();
      const messageEvents = timeline.getEvents().filter(
        (event) =>
          event.getType() === 'm.room.message' ||
          event.getType() === 'm.room.encrypted'
      );

      const formattedMessages = messageEvents.map((event) => ({
        id: event.getId(),
        sender: event.getSender(),
        content: event.getContent().body,
        timestamp: event.getTs(),
        type: event.getContent().msgtype === 'm.image' ? 'image' : 'text',
        fileUrl: event.getContent().url,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const listenToNewMessages = () => {
    sdk.on('Room.timeline', (event, room) => {
      if (room.roomId === roomId) {
        const newMessage = {
          id: event.getId(),
          sender: event.getSender(),
          content: event.getContent().body,
          timestamp: event.getTs(),
          type: event.getContent().msgtype === 'm.image' ? 'image' : 'text',
          fileUrl: event.getContent().url,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const content = {
        body: inputMessage,
        msgtype: 'm.text',
      };

      await sdk.sendEvent(roomId, 'm.room.message', content);
      setInputMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = {
        body: file.name,
        filename: file.name,
        msgtype: file.type.startsWith('image/') ? 'm.image' : 'm.file',
        // 上传文件到 Matrix 媒体服务器
        url: await sdk.uploadContent(file),
      };

      await sdk.sendEvent(roomId, 'm.room.message', content);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const cleanup = () => {
    sdk.removeAllListeners('Room.timeline');
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.png" />
            <AvatarFallback>
              {isGroupChat ? 'GC' : 'DM'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {isGroupChat ? 'Group Chat' : 'Direct Message'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isGroupChat ? 'Multiple participants' : 'Private conversation'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isGroupChat && (
            <Button variant="ghost" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === userId
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.sender === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } rounded-lg p-3`}
              >
                {message.type === 'text' ? (
                  <p>{message.content}</p>
                ) : message.type === 'image' ? (
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-full rounded"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span>{message.content}</span>
                  </div>
                )}
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
