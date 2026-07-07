import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the Next.js frontend can reach the backend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🚀 ScriptoraAI backend running on http://localhost:${port}`);
  console.log(`📡 WebSocket gateway ready for collaboration`);
}

bootstrap();
