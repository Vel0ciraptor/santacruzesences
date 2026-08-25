/**
 * Seeder: crea el usuario Admin inicial y datos de demo
 * Ejecutar con: npx ts-node src/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder...');

  // Admin inicial
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminNombre = process.env.SEED_ADMIN_NOMBRE || 'Administrador';

  if (!adminEmail || !adminPassword) {
    console.log('⚠️  SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD deben estar definidos. Saltando creación de admin.');
  } else {
    const adminExiste = await prisma.usuario.findUnique({ where: { email: adminEmail } });

    if (!adminExiste) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await prisma.usuario.create({
        data: {
          nombre: adminNombre,
          email: adminEmail,
          passwordHash: hash,
          rol: 'ADMIN',
        },
      });
      console.log(`✅ Admin creado: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin ya existe: ${adminEmail}`);
    }
  }

  // Premios de ruleta demo
  const premiosCount = await prisma.premio.count();
  if (premiosCount === 0) {
    await prisma.premio.createMany({
      data: [
        { texto: '¡10% de descuento!', color: '#10b981', peso: 3 },
        { texto: 'Muestra gratis', color: '#3b82f6', peso: 4 },
        { texto: '¡20% de descuento!', color: '#8b5cf6', peso: 1 },
        { texto: 'Envío gratis', color: '#f59e0b', peso: 2 },
        { texto: '¡Inténtalo de nuevo!', color: '#6b7280', peso: 5 },
        { texto: 'Gift card Bs. 50', color: '#ef4444', peso: 1 },
      ],
    });
    console.log('✅ Premios de ruleta creados');
  }

  // Producto de demo
  const productosCount = await prisma.producto.count();
  if (productosCount === 0) {
    const producto = await prisma.producto.create({
      data: {
        sku: 'SCE-001',
        nombre: 'Eau de Parfum Essence',
        marca: 'Santa Cruz Essence',
        descripcion: 'Fragancia floral con notas de jazmín y sándalo. 100ml.',
        precio: 280,
        imagenUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500',
        stock: {
          create: { cantidad: 50, stockMinimo: 10 },
        },
      },
    });
    console.log(`✅ Producto demo creado: ${producto.sku}`);
  }

  console.log('🎉 Seeder completado');
}

main()
  .catch((e) => { console.error('❌ Error en seeder:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
