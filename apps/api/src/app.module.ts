import { join } from 'path';
import { Module } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarCatalogModule } from './modules/catalogs/cars/car-catalog.module';
import { BikeCatalogModule } from './modules/catalogs/bikes/bike-catalog.module';
import { BatteryCatalogModule } from './modules/catalogs/batteries/battery-catalog.module';
import { PostsModule } from './modules/posts/posts.module';
import { UploadModule } from './modules/upload/upload.module';
import { AddressModule } from './modules/address/address.module';
import { PostReviewModule } from './modules/post-review/post-review.module';
import { PayosModule } from './modules/payos/payos.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ServiceTypesModule } from './modules/service-types/service-types.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { OrdersModule } from './modules/orders/orders.module';
// import { DebugMiddleware } from './core/middleware/debug.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '.env'),
      isGlobal: true,
      load: [databaseConfig],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationSchema: envValidationSchema,
    }),
    ScheduleModule.forRoot(), // Enable cron jobs
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';
        // Dev: ít retry + timeout ngắn để start nhanh hoặc fail nhanh
        const retryAttempts = isDev ? 2 : 5;
        const retryDelay = isDev ? 1000 : 3000;
        const connectionTimeoutMillis = isDev ? 10_000 : 60_000;

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<number>('DB_PORT') ?? 5432),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: isDev,
          retryAttempts,
          retryDelay,
          extra: {
            max: isDev ? 5 : 10,
            min: isDev ? 1 : 2,
            idleTimeoutMillis: 600_000,
            connectionTimeoutMillis,
          },
        };
      },
    }),
    AccountsModule,
    AuthModule,
    CarCatalogModule,
    BikeCatalogModule,
    BatteryCatalogModule,
    PostsModule,
    UploadModule,
    AddressModule,
    PostReviewModule,
    PayosModule,
    SettingsModule,
    ServiceTypesModule,
    WalletsModule,
    TransactionsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(DebugMiddleware).forRoutes('*');
//   }
// }
