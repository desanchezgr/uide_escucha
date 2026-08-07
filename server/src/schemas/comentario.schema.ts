import { z } from 'zod';

export const crearComentarioSchema = z.object({
  comentario: z.string().min(1, 'El comentario no puede estar vacio').max(2000),
  archivos_base64: z.array(z.string()).optional().default([]),
  archivos_nombre: z.array(z.string()).optional().default([]),
  archivos_tipo: z.array(z.string()).optional().default([]),
  archivo_base64: z.string().optional(),
  archivo_nombre: z.string().optional(),
  archivo_tipo: z.string().optional(),
});

export const actualizarComentarioSchema = z.object({
  comentario: z.string().min(1).max(2000),
});

export type CrearComentarioDTO = z.infer<typeof crearComentarioSchema>;
export type ActualizarComentarioDTO = z.infer<typeof actualizarComentarioSchema>;