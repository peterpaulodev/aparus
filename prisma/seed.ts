import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Limpar dados antigos para evitar conflitos
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.barbershop.deleteMany()
  await prisma.user.deleteMany()

  // 2. Criar o Usuário Dono (Admin)
  // Como estamos em dev, criamos um user "fake" que seria o dono logado
  const owner = await prisma.user.create({
    data: {
      name: "Admin Aparatus",
      email: "admin@aparatus.com",
      image: "https://utfs.io/f/c97a2b53-46ef-466d-8a24-772645604169-u91.png",
      emailVerified: new Date(),
    }
  })

  // 3. Criar a Barbearia ligada ao Dono
  const barbershop = await prisma.barbershop.create({
    data: {
      name: "Barbearia Aparatus",
      slug: "aparatus-barber",
      logoUrl: "https://utfs.io/f/8a45a2e6-a82f-4e58-9419-75f82d1c6184-1f9.png",
      ownerId: owner.id, // VÍNCULO IMPORTANTE

      // Criar Serviços
      services: {
        create: [
          {
            name: "Corte de Cabelo",
            description: "Estilo degradê ou social na tesoura.",
            price: 45.0,
            duration: 45,
          },
          {
            name: "Barba Completa",
            description: "Modelagem e toalha quente.",
            price: 35.0,
            duration: 30,
          },
          {
            name: "Pézinho",
            description: "Acabamento no pescoço e costeletas.",
            price: 15.0,
            duration: 15,
          },
          {
            name: "Combo (Corte + Barba)",
            description: "O pacote completo.",
            price: 70.0,
            duration: 75,
          },
        ],
      },

      // Criar Barbeiros (Funcionários)
      barbers: {
        create: [
          {
            name: "João Navalha",
            avatarUrl: "https://utfs.io/f/c97a2b53-46ef-466d-8a24-772645604169-u91.png",
            description: "Especialista em cortes clássicos.",
            availability: {
              monday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
              tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            }
          },
          {
            name: "Carlos Tesoura",
            avatarUrl: "https://utfs.io/f/45c7e034-7833-4668-b715-680970364673-u92.png",
            description: "Mestre do degradê.",
            availability: {
              monday: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
              tuesday: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
            }
          },
        ],
      },
    },
  })

  console.log(`✅ Barbearia criada: ${barbershop.name}`)
  console.log(`✅ Dono criado: ${owner.name} (${owner.email})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })