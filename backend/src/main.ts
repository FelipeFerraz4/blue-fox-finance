import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { I18nExceptionFilter } from './common/i18n/i18n-exception.filter';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global para a API
  app.setGlobalPrefix('api');

  // Habilitar CORS para o frontend Angular
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação automática de payloads DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Mensagens de erro no idioma do Accept-Language (pt no código, en pelo dicionário)
  app.useGlobalFilters(new I18nExceptionFilter(app.get(HttpAdapterHost).httpAdapter));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 BlueFox Finance API rodando em http://localhost:${port}/api`);
}
bootstrap();
