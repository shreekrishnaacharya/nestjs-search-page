import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root2",
        password: "kamal12345",
        database: "demo",
        entities: ["dist/../**/*.entity.js"],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
