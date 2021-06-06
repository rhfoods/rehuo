import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { ConnectionOptions } from 'typeorm';
import { SystemEnvironments } from './common/constants/system.constant';

const config: any = dotenv.parse(fs.readFileSync(`${__dirname}/../config/system.env`));

const baseConf = {
  type: config.SQLDB_TYPE || ('mysql' as any),
  port: parseInt(config.SQLDB_PORT, 10) || 3306,
  database: config.SQLDB_DATABASE,
  charset: 'utf8mb4',
  entities: [__dirname + '/models/**/*{.js,.ts}'],
  timezone: '+08:00',
  host: 'localhost',
  username: 'root',
  password: config.SQLDB_PASSWORD,
};

const dbConfig: ConnectionOptions =
  config.APP_ENV === SystemEnvironments.PROD
    ? {
        ...baseConf,
        logging: false,
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
        migrationsTableName: 'migrations_typeorm',
        cli: {
          migrationsDir: 'src/migrations',
        },
        migrationsRun: false,
      }
    : {
        ...baseConf,
        logging: true,
        synchronize: true,
      };

export default dbConfig;
