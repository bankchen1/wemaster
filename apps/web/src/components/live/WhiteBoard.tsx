import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message } from 'antd';
import { WhiteWebSdk, RoomWhiteboard } from 'white-web-sdk';

interface WhiteBoardProps {
  isHost: boolean;
  classId: string;
}

export const WhiteBoard: React.FC<WhiteBoardProps> = ({ isHost, classId }) => {
  const [room, setRoom] = useState<any>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');

  useEffect(() => {
    initializeWhiteboard();
    return () => {
      room?.disconnect();
    };
  }, [classId]);

  const initializeWhiteboard = async () => {
    try {
      const sdk = new WhiteWebSdk({
        appIdentifier: process.env.REACT_APP_WHITEBOARD_APP_ID!,
      });

      // 获取白板房间信息
      const response = await fetch(`/api/live-classes/${classId}/whiteboard`);
      const { roomToken, roomUUID } = await response.json();

      const room = await sdk.joinRoom({
        uuid: roomUUID,
        roomToken: roomToken,
        invisiblePlugins: ['audio'],
        disableNewPencil: false,
      });

      setRoom(room);

      if (whiteboardRef.current) {
        const whiteBoard = new RoomWhiteboard({
          room,
          container: whiteboardRef.current,
          viewMode: isHost ? 'freedom' : 'follower',
        });
      }

      message.success('白板初始化成功');
    } catch (error) {
      message.error('白板初始化失败，请重试');
      console.error('Failed to initialize whiteboard:', error);
    }
  };

  const changeTool = (tool: string) => {
    if (room) {
      room.setMemberState({
        currentApplianceName: tool,
        strokeWidth,
        strokeColor,
      });
      setCurrentTool(tool);
    }
  };

  const clearBoard = () => {
    if (room && isHost) {
      room.cleanCurrentScene();
      message.success('白板已清空');
    }
  };

  const undo = () => {
    if (room) {
      room.undo();
    }
  };

  const redo = () => {
    if (room) {
      room.redo();
    }
  };

  return (
    <div className="whiteboard-container">
      {isHost && (
        <Space className="toolbar">
          <Button
            onClick={() => changeTool('pencil')}
            type={currentTool === 'pencil' ? 'primary' : 'default'}
          >
            铅笔
          </Button>
          <Button
            onClick={() => changeTool('rectangle')}
            type={currentTool === 'rectangle' ? 'primary' : 'default'}
          >
            矩形
          </Button>
          <Button
            onClick={() => changeTool('ellipse')}
            type={currentTool === 'ellipse' ? 'primary' : 'default'}
          >
            圆形
          </Button>
          <Button
            onClick={() => changeTool('text')}
            type={currentTool === 'text' ? 'primary' : 'default'}
          >
            文字
          </Button>
          <Button
            onClick={() => changeTool('eraser')}
            type={currentTool === 'eraser' ? 'primary' : 'default'}
          >
            橡皮擦
          </Button>
          <Button onClick={undo}>撤销</Button>
          <Button onClick={redo}>重做</Button>
          <Button onClick={clearBoard} danger>
            清空白板
          </Button>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setStrokeColor(e.target.value);
              room?.setMemberState({ strokeColor: e.target.value });
            }}
          />
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => {
              setStrokeWidth(Number(e.target.value));
              room?.setMemberState({ strokeWidth: Number(e.target.value) });
            }}
          />
        </Space>
      )}
      <div
        ref={whiteboardRef}
        className="whiteboard"
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
};
