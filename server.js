import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en el archivo .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

app.post("/api/examen", async (req, res) => {
  try {
    const { texto, numeroPreguntas, dificultad } = req.body;

    if (!texto || !numeroPreguntas || !dificultad) {
      return res.status(400).json({
        error: "Faltan datos obligatorios."
      });
    }

    const prompt = `
Actúa como un profesor experto.

A partir del siguiente texto, genera un examen tipo test.

Texto:
${texto}

Número de preguntas: ${numeroPreguntas}
Dificultad: ${dificultad}

Devuelve SOLO JSON válido, sin markdown y sin texto extra, con esta estructura exacta:

{
  "titulo": "Título del examen",
  "preguntas": [
    {
      "pregunta": "Texto de la pregunta",
      "opciones": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "respuestaCorrecta": "A",
      "explicacion": "Breve explicación de la respuesta"
    }
  ]
}

Reglas:
- Cada pregunta debe tener 4 opciones.
- Solo una opción debe ser correcta.
- La respuesta correcta debe ser solo una letra: A, B, C o D.
- Las preguntas deben estar relacionadas directamente con el texto.
- No inventes contenido fuera del texto.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let textoIA = response.text;

    textoIA = textoIA
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const examen = JSON.parse(textoIA);

    res.json(examen);
  } catch (error) {
    console.error("ERROR COMPLETO DEL SERVIDOR:");
    console.error(error);

    res.status(500).json({
      error: error.message || "Error al generar el examen."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});