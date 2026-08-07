import { z } from 'zod';

export const AREAS = [
  'ti_soporte',
  'bibliotecario',
  'conserje',
  'mantenimiento',
  'secretaria',
  'bienestar universitario',
  'financiero',
] as const;

export const TIPOS_REPORTE = ['incidente', 'sugerencia', 'peticion', 'felicitacion'] as const;

export const crearTicketSchema = z.object({
  titulo: z.string().max(200).optional().default(''),
  emocion: z.string().min(1, 'Selecciona como te sientes respecto al reporte.').max(100),
  descripcion: z.string().min(20, 'La descripcion debe tener al menos 20 caracteres').max(500, 'La descripcion no puede exceder los 500 caracteres'),
  tipo: z.enum(TIPOS_REPORTE).optional().default('incidente'),
  area: z.enum(AREAS, { message: 'Selecciona un area a la que corresponde el reporte.' }).optional(),
  zona: z.string().max(120).optional(),
  clasificacion: z.string().max(60).optional(),
  urgencia: z.enum(['critica', 'alta', 'media', 'baja']).optional(),
  archivos_base64: z.array(z.string()).optional().default([]),
  archivos_nombre: z.array(z.string()).optional().default([]),
  archivos_tipo: z.array(z.string()).optional().default([]),
  archivo_base64: z.string().optional(),
  archivo_nombre: z.string().optional(),
  archivo_tipo: z.string().optional(),
});

export const actualizarTicketSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(20).max(500).optional(),
  tipo: z.enum(TIPOS_REPORTE).optional(),
  emocion: z.string().min(1).max(100).optional(),
  estado: z.enum(['pendiente', 'en_proceso', 'resuelto', 'rechazado']).optional(),
  area: z.enum(AREAS).optional(),
  zona: z.string().max(120).optional(),
  clasificacion: z.string().max(60).optional(),
  urgencia: z.enum(['critica', 'alta', 'media', 'baja']).optional(),
}).partial();

export type CrearTicketDTO = z.infer<typeof crearTicketSchema>;
export type ActualizarTicketDTO = z.infer<typeof actualizarTicketSchema>;
