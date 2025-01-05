export const jitsiConfig = {
  domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
  appId: process.env.JITSI_APP_ID,
  appSecret: process.env.JITSI_APP_SECRET,
  // JWT 配置
  jwt: {
    expiresIn: '24h',
    algorithm: 'HS256',
  },
  // 会议配置
  meetingDefaults: {
    startWithAudioMuted: true,
    startWithVideoMuted: false,
    disableDeepLinking: true,
    prejoinPageEnabled: false,
  },
  // 录制配置
  recording: {
    enabled: true,
    storageDir: process.env.RECORDING_STORAGE_DIR || './recordings',
    format: 'mp4',
  },
};
