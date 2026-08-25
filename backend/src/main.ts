import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function ensureAdmin(prisma: PrismaService) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const nombre = process.env.SEED_ADMIN_NOMBRE || 'Administrador';

  if (!email || !password) {
    console.log('⚠️  SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD no definidos. Saltando auto-creación de admin.');
    return;
  }

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin ya existe: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash: hash,
      rol: 'ADMIN',
    },
  });
  console.log(`✅ Admin creado automáticamente: ${email}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma = app.get(PrismaService);
  await ensureAdmin(prisma);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}/api/v1`);
}
bootstrap();
