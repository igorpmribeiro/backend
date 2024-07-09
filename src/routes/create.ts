import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { getEmailClient } from "../lib/mail";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trip",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          invite_emails: z.array(z.string().email()),
        }),
      },
    },
    async (req) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        invite_emails,
      } = req.body;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Você não pode iniciar uma viagem no passado.");
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error(
          "A data de término não pode ser anterior a data de início."
        );
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...invite_emails.map((email) => {
                  return { email };
                })
              ],
            }
          }
        }
      });

      const confirmationLink = `http://localhost:3000/trips/confirm/${trip.id}`

      const mail = await getEmailClient();

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "contato@plann.er",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: "Confirmação de viagem",
        html: `
        <div style="font-family: sans-serif; font-size: 14px; line-height: 1.4;">
          <p>Olá, ${owner_name}!</p>
          <br />
          <p>Sua viagem para ${destination} foi criada com sucesso.</p>
          <br />
          <p><strong>Detalhes da viagem:</strong></p>
          <strong>Data de partida: ${dayjs(starts_at).format("DD/MM/YYYY")}<br />
          Data de retorno: ${dayjs(ends_at).format("DD/MM/YYYY")}</strong>
          <br />
          <br />
          <p>Para confirmar sua viagem <a href="${confirmationLink}">clique aqui</a>`.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { trip_id: trip.id };
    }
  );
}
