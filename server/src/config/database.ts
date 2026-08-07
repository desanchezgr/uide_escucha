import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../../../.env') });

import { Pool, neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = (globalThis as any).WebSocket;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada. Verifica tu archivo .env');
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 50,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  statement_timeout: 15000,
});

pool.on('error', (err: any) => console.error('[DB] Pool error:', err.message));

class UnsafeSql {
  constructor(public value: string) {}
}

function toQueryAndParams(strings: TemplateStringsArray | string[], ...values: any[]): [string, any[]] {
  const params: any[] = [];
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      if (values[i] instanceof UnsafeSql) {
        query += values[i].value;
      } else {
        params.push(values[i]);
        query += '$' + params.length;
      }
    }
  }
  return [query, params];
}

function sql(strings: TemplateStringsArray | string[], ...values: any[]): Promise<any> {
  const [query, params] = toQueryAndParams(strings, ...values);
  return pool.query(query, params).then(r => r.rows);
}

sql.query = (text: string, params?: any[]) => pool.query(text, params).then(r => r.rows);
sql.unsafe = (text: string) => new UnsafeSql(text);

export { sql };
