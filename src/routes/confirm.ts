import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/confirm/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req) => {
      return { tripId: req.params.tripId }
    }
  )};

  //     const { tripId } = req.params;
  //     const { email } = req.body;

  //     const trip = await prisma.trip.findUnique({
  //       where: {
  //         id: tripId,
  //       },
  //       include: {
  //         participants: true,
  //       },
  //     });

  //     if (!trip) {
  //       throw new Error("Viagem não encontrada.");
  //     }

  //     const participant = trip.participants.find(
  //       (participant) => participant.email === email
  //     );

  //     if (!participant) {
  //       throw new Error("Participante não encontrado.");
  //     }

  //     if (participant.is_confirmed) {
  //       throw new Error("Participante já confirmado.");
  //     }

  //     await prisma.participant.update({
  //       where: {
  //         id: participant.id,
  //       },
  //       data: {
  //         is_confirmed: true,
  //       },
  //     });
  //   })
  // };