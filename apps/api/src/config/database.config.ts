import { registerAs } from '@nestjs/config';
import { Pool } from 'pg';

export default registerAs('database', () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // 非连接池配置，用于某些需要直接连接的操作
  const nonPoolingConfig = {
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: process.env.NODE_ENV === 'production',
  };

  return {
    pool,
    nonPoolingConfig,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  };
});
