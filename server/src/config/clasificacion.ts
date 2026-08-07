export interface ClasificacionResultado {
  clasificacion: string;
  urgencia: 'critica' | 'alta' | 'media' | 'baja';
  area: string | null;
}

interface DiccionarioEntrada {
  clasificacion: string;
  urgencia: ClasificacionResultado['urgencia'];
  area: string | null;
  palabras: string[];
}

const DICTONARIO: DiccionarioEntrada[] = [
  {
    clasificacion: 'Tecnología',
    urgencia: 'alta',
    area: 'ti_soporte',
    palabras: ['internet', 'wifi', 'computadora', 'computador', 'pc', 'sistema', 'plataforma', 'correo', 'red', 'software', 'impresora', 'proyector', 'contrasena', 'aula virtual', 'moodle', 'teams', 'tecnico', 'laptop'],
  },
  {
    clasificacion: 'Biblioteca',
    urgencia: 'media',
    area: 'bibliotecario',
    palabras: ['biblioteca', 'libro', 'prestamo', 'lectura', 'catalogo', 'sala de estudio', 'texto', 'estante', 'revista'],
  },
  {
    clasificacion: 'Limpieza',
    urgencia: 'media',
    area: 'conserje',
    palabras: ['basura', 'sucio', 'limpieza', 'baño', 'inodoro', 'insectos', 'olor', 'desechos', 'aula sucia'],
  },
  {
    clasificacion: 'Infraestructura',
    urgencia: 'alta',
    area: 'mantenimiento',
    palabras: ['luz', 'electricidad', 'tuberia', 'fuga', 'puerta', 'ventana', 'aire acondicionado', 'techo', 'gotera', 'asiento', 'silla', 'instalacion', 'cableado', 'grieta', 'foco'],
  },
  {
    clasificacion: 'Administrativo',
    urgencia: 'media',
    area: 'secretaria',
    palabras: ['documento', 'certificado', 'matricula', 'calificaciones', 'nota', 'tramite', 'acta', 'constancia', 'secretaria'],
  },
  {
    clasificacion: 'Bienestar',
    urgencia: 'alta',
    area: 'bienestar universitario',
    palabras: ['acoso', 'discriminacion', 'bullying', 'bienestar', 'violencia', 'psicologo', 'emocional', 'hostigamiento', 'maltrato'],
  },
  {
    clasificacion: 'Financiero',
    urgencia: 'alta',
    area: 'financiero',
    palabras: ['pago', 'pension', 'factura', 'deuda', 'beca', 'financiero', 'comprobante', 'cobro'],
  },
  {
    clasificacion: 'Seguridad',
    urgencia: 'critica',
    area: 'conserje',
    palabras: ['robo', 'hurto', 'inseguridad', 'seguridad', 'agresion', 'asalto', 'amenaza', 'vigilancia'],
  },
  {
    clasificacion: 'Académico',
    urgencia: 'media',
    area: null,
    palabras: ['profesor', 'docente', 'clase', 'materia', 'horario', 'examen', 'catedra', 'curso', 'malla', 'ensenanza', 'aula'],
  },
  {
    clasificacion: 'Alimentación',
    urgencia: 'baja',
    area: 'conserje',
    palabras: ['cafeteria', 'almuerzo', 'comida', 'alimentacion', 'restaurante', 'bar'],
  },
];

export function normalizar(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clasificarIncidente(titulo: string, descripcion: string): ClasificacionResultado {
  const texto = `${titulo || ''} ${descripcion || ''}`;
  const textoNormalizado = normalizar(texto);

  for (const entrada of DICTONARIO) {
    const coincidencia = entrada.palabras.some((palabra) => textoNormalizado.includes(normalizar(palabra)));
    if (coincidencia) {
      return {
        clasificacion: entrada.clasificacion,
        urgencia: entrada.urgencia,
        area: entrada.area,
      };
    }
  }

  return {
    clasificacion: 'general',
    urgencia: 'media',
    area: null,
  };
}
