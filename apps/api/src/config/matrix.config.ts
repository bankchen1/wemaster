export const matrixConfig = {
  homeserverUrl: process.env.MATRIX_HOMESERVER_URL || 'https://matrix.org',
  accessToken: process.env.MATRIX_ACCESS_TOKEN,
  // 用户配置
  user: {
    prefix: '@wepal_',
    domain: process.env.MATRIX_USER_DOMAIN || 'matrix.org',
  },
  // 房间配置
  room: {
    defaultVisibility: 'private',
    defaultEncryption: true,
    timelineLimit: 50,
  },
  // 媒体配置
  media: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
};
