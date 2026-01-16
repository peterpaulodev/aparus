import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa dados existentes (cuidado em produção!)
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.barbershop.deleteMany();

  console.log('🗑️  Dados antigos removidos');

  // 1. Criar Barbearias
  const barbearia1 = await prisma.barbershop.create({
    data: {
      name: 'Barbearia do Zé',
      slug: 'barbearia-do-ze',
      logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    },
  });

  const barbearia2 = await prisma.barbershop.create({
    data: {
      name: 'The Gentleman Barber',
      slug: 'gentleman-barber',
      logoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    },
  });

  console.log('✅ Barbearias criadas');

  // 2. Criar Barbeiros para Barbearia do Zé
  const barbeiro1 = await prisma.barber.create({
    data: {
      name: 'José Silva',
      email: 'jose@barbearia.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      barbershopId: barbearia1.id,
      availability: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '14:00' },
      },
    },
  });

  const barbeiro2 = await prisma.barber.create({
    data: {
      name: 'Carlos Mendes',
      email: 'carlos@barbearia.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
      barbershopId: barbearia1.id,
      availability: {
        tuesday: { start: '10:00', end: '19:00' },
        wednesday: { start: '10:00', end: '19:00' },
        thursday: { start: '10:00', end: '19:00' },
        friday: { start: '10:00', end: '19:00' },
        saturday: { start: '10:00', end: '16:00' },
      },
    },
  });

  // 3. Criar Barbeiros para The Gentleman Barber
  const barbeiro3 = await prisma.barber.create({
    data: {
      name: 'Ricardo Santos',
      email: 'ricardo@gentleman.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=52',
      barbershopId: barbearia2.id,
    },
  });

  console.log('✅ Barbeiros criados');

  // 4. Criar Serviços para Barbearia do Zé
  const servico1 = await prisma.service.create({
    data: {
      name: 'Corte Simples',
      price: 35.0,
      duration: 30,
      description: 'Corte de cabelo tradicional com máquina e tesoura',
      barbershopId: barbearia1.id,
    },
  });

  const servico2 = await prisma.service.create({
    data: {
      name: 'Corte + Barba',
      price: 55.0,
      duration: 45,
      description: 'Corte de cabelo completo + aparar e modelar barba',
      barbershopId: barbearia1.id,
    },
  });

  const servico3 = await prisma.service.create({
    data: {
      name: 'Degradê Profissional',
      price: 45.0,
      duration: 40,
      description: 'Corte degradê com transição suave e acabamento premium',
      barbershopId: barbearia1.id,
    },
  });

  const servico4 = await prisma.service.create({
    data: {
      name: 'Barba Completa',
      price: 30.0,
      duration: 25,
      description: 'Aparar, modelar e hidratar a barba',
      barbershopId: barbearia1.id,
    },
  });

  // 5. Criar Serviços para The Gentleman Barber
  const servico5 = await prisma.service.create({
    data: {
      name: 'Executive Cut',
      price: 80.0,
      duration: 60,
      description: 'Corte premium com tratamento capilar incluso',
      barbershopId: barbearia2.id,
    },
  });

  const servico6 = await prisma.service.create({
    data: {
      name: 'Royal Shave',
      price: 60.0,
      duration: 45,
      description: 'Barbear tradicional com toalha quente e produtos premium',
      barbershopId: barbearia2.id,
    },
  });

  console.log('✅ Serviços criados');

  // 6. Criar Clientes
  const cliente1 = await prisma.customer.create({
    data: {
      name: 'Pedro Oliveira',
      phone: '+351912345678',
      email: 'pedro@email.com',
      barbershopId: barbearia1.id,
    },
  });

  const cliente2 = await prisma.customer.create({
    data: {
      name: 'João Costa',
      phone: '+351923456789',
      email: 'joao@email.com',
      barbershopId: barbearia1.id,
    },
  });

  const cliente3 = await prisma.customer.create({
    data: {
      name: 'Miguel Ferreira',
      phone: '+351934567890',
      barbershopId: barbearia2.id,
    },
  });

  console.log('✅ Clientes criados');

  // 7. Criar Agendamentos
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const doisDias = new Date(hoje);
  doisDias.setDate(doisDias.getDate() + 2);

  await prisma.booking.create({
    data: {
      date: new Date(hoje.setHours(10, 0, 0, 0)),
      status: 'CONFIRMED',
      barbershopId: barbearia1.id,
      barberId: barbeiro1.id,
      serviceId: servico1.id,
      customerId: cliente1.id,
    },
  });

  await prisma.booking.create({
    data: {
      date: new Date(hoje.setHours(14, 30, 0, 0)),
      status: 'CONFIRMED',
      barbershopId: barbearia1.id,
      barberId: barbeiro2.id,
      serviceId: servico2.id,
      customerId: cliente2.id,
    },
  });

  await prisma.booking.create({
    data: {
      date: new Date(amanha.setHours(11, 0, 0, 0)),
      status: 'PENDING',
      barbershopId: barbearia1.id,
      barberId: barbeiro1.id,
      serviceId: servico3.id,
      customerId: cliente1.id,
    },
  });

  await prisma.booking.create({
    data: {
      date: new Date(doisDias.setHours(15, 0, 0, 0)),
      status: 'CONFIRMED',
      barbershopId: barbearia2.id,
      barberId: barbeiro3.id,
      serviceId: servico5.id,
      customerId: cliente3.id,
    },
  });

  console.log('✅ Agendamentos criados');

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📍 Acesse as barbearias em:');
  console.log(`   - http://localhost:3000/${barbearia1.slug}`);
  console.log(`   - http://localhost:3000/${barbearia2.slug}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
