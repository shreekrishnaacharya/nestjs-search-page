import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('School Admin Backend Api')
    .setDescription('School Admin Backend Api')
    .setVersion('2.0')
    .addBearerAuth()
    .addSecurityRequirements('Bearer')
    .build();
  const options = {
    swaggerOptions: {
      persistAuthorization: true,
      exports: true,
      authAction: {
        defaultBearerAuth: {
          name: 'defaultBearerAuth',
          schema: {
            description: 'Default',
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'thisIsASampleBearerAuthToken123',
        },
      },
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
