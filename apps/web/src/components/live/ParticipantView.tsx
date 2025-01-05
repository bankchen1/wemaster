import React, { useEffect, useRef } from 'react';
import { Card, Typography } from 'antd';
import { LocalParticipant, RemoteParticipant, Track } from 'livekit-client';

const { Text } = Typography;

interface ParticipantViewProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  participant,
  isLocal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const videoTrack = Array.from(participant.videoTracks.values())
      .find(track => track.track?.kind === 'video')?.track;
    
    const audioTrack = Array.from(participant.audioTracks.values())
      .find(track => track.track?.kind === 'audio')?.track;

    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
    }

    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
    }

    return () => {
      if (videoTrack && videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
      if (audioTrack && audioRef.current) {
        audioTrack.detach(audioRef.current);
      }
    };
  }, [participant]);

  const isMuted = !Array.from(participant.audioTracks.values())
    .some(track => !track.isMuted);

  const isVideoMuted = !Array.from(participant.videoTracks.values())
    .some(track => !track.isMuted);

  return (
    <Card
      className={`participant-view ${isLocal ? 'local' : 'remote'}`}
      size="small"
      title={
        <div className="participant-header">
          <Text strong>{participant.identity}</Text>
          {isMuted && <Text type="secondary">(已静音)</Text>}
          {isVideoMuted && <Text type="secondary">(视频已关闭)</Text>}
        </div>
      }
    >
      <div className="video-container">
        {isVideoMuted ? (
          <div className="video-placeholder">
            <Text type="secondary">视频已关闭</Text>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // 本地视频需要静音以避免回声
          />
        )}
      </div>
      <audio ref={audioRef} autoPlay playsInline />
    </Card>
  );
};
