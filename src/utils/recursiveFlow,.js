export async function iniciarFluxoRecursivo(userId, canal) {
  let registro = await prisma.userAction.findUnique({ where: { userId } });
  const agora = new Date();

  if (!registro) {
    registro = await prisma.userAction.create({
      data: { userId, count: 0, lastAction: agora },
    });
  } else if (!mesmoDia(agora, registro.lastAction)) {
    registro.count = 0;
  }
}