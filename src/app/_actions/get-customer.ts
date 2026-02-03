'use server';

import { prisma } from '@/lib/prisma';

type GetCustomerInput = {
  phone: string;
  barbershopId: string;
};

type GetCustomerResult =
  | { success: true; name: string | null }
  | { success: false; error: string };

export async function getCustomerName(
  input: GetCustomerInput
): Promise<GetCustomerResult> {
  try {
    const { phone, barbershopId } = input;

    // Normaliza o telefone: remove todos os caracteres não numéricos
    const normalizedPhone = phone.replace(/\D/g, '');

    // Valida se o telefone tem pelo menos 10 dígitos
    if (normalizedPhone.length < 10) {
      return { success: true, name: null };
    }

    // Busca o cliente pelo telefone e barbearia
    const customer = await prisma.customer.findFirst({
      where: {
        phone: normalizedPhone,
        barbershopId,
      },
      select: {
        name: true,
      },
    });

    return {
      success: true,
      name: customer?.name || null,
    };
  } catch (error) {
    console.error('[GET_CUSTOMER_ERROR]', error);
    return {
      success: false,
      error: 'Erro ao buscar cliente',
    };
  }
}
