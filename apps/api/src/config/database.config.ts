import { registerAs } from '@nestjs/config';
import { Pool } from 'pg';

export default registerAs('database', () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // 非连接池配置，用于某些需要直接连接的操作
  const nonPoolingConfig = {
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  return {
    type: 'postgres',
    pool,
    nonPoolingConfig,
    host: process.env.POSTGRES_HOST || 'ep-fancy-glitter-a51b3f8k-pooler.us-east-2.aws.neon.tech',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'neondb_owner',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || 'neondb',
    ssl: true,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
  };
});
