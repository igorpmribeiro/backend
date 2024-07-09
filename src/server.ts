import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrip } from "./routes/create";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm";

const app = fastify()

app.register(cors, {
  origin: "http://localhost:3333",
  methods: ["GET", "POST"],
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip)
app.register(confirmTrip)

app.listen({port: 3333}).then(() => {
  console.log("Server Running")
})