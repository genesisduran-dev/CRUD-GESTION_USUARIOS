console.log("RUNNING FROM (cwd):", process.cwd());


// 1) Cargar variables de entorno primero
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// 2) Cargar .env (UNA sola vez)
const result = dotenv.config({ path: "./.env" });
console.log("dotenv result:", result);
console.log("DATABASE_URL ->", process.env.DATABASE_URL);

// 3) Inicializar app y Prisma
const app = express();
const prisma = new PrismaClient();

const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("PUBLIC"));

// Ruta de prueba
app.get("/health", (req, res) => {
  res.send("OK");
});

// Crear persona (GRABAR)
app.post("/api/personas", async (req, res) => {
  try {
    const { nombre, apellido, direccion, telefono, municipio } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !telefono?.trim()) {
      return res.status(400).json({
        error: "Campos obligatorios: nombre, apellido, telefono"
      });
    }

    const persona = await prisma.persona.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        direccion: (direccion || "").trim(),
        telefono: telefono.trim(),
        municipio: (municipio || "").trim()
      }
    });

    res.json(persona);

  } catch (error) {
    res.status(500).json({ error: "Error al crear persona" });
  }
});

// Listar personas (CONSULTAR)
app.get('/api/personas', async (req, res) => {
  const personas = await prisma.persona.findMany();
  res.json(personas);
});

// Editar persona (EDITAR)
app.put('/api/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, direccion, telefono, municipio } = req.body;
    const persona = await prisma.persona.update({
      where: { id: Number(id) },
      data: { nombre, apellido, direccion, telefono, municipio }
    });
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar persona' });
  }
});

// Eliminar persona (ELIMINAR)
app.delete('/api/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.persona.delete({ where: { id: Number(id) } });
    res.json({ message: 'Persona eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
});

app.use(express.static("public"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
