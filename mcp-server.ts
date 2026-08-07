import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuración de la URL base del backend de UIDE Escucha
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/reportes";
const API_AUTH_BASE_URL = process.env.API_AUTH_BASE_URL || "http://localhost:3000/api/auth";
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;
let storedBearerToken = API_BEARER_TOKEN || "";

function getAxiosConfig(overrides: Record<string, any> = {}) {
  const config: Record<string, any> = { ...overrides };
  if (storedBearerToken) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${storedBearerToken}`,
    };
  }
  return config;
}

function requireAuthToken() {
  if (!storedBearerToken) {
    throw new Error(
      'Token no configurado. Ejecuta una de las herramientas de "login" o asigna la variable API_BEARER_TOKEN.'
    );
  }
}

// Inicialización del servidor MCP
const server = new Server(
  {
    name: "uide-escucha-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registro de Herramientas (Tools) expuestas a la IA
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "listar_reportes",
        description: "Obtiene el listado de reportes de UIDE Escucha.",
        inputSchema: {
          type: "object",
          properties: {
            categoria: {
              type: "string",
              description: "Filtrar por categoría (incidente, sugerencia, peticion, felicitacion)",
            },
            estado: {
              type: "string",
              description: "Filtrar por estado (pendiente, en_proceso, resuelto)",
            },
          },
        },
      },
      {
        name: "crear_reporte",
        description: "Registra un nuevo incidente, sugerencia, petición o felicitación en la plataforma UIDE Escucha.",
        inputSchema: {
          type: "object",
          properties: {
            descripcion: { type: "string", description: "Detalle del incidente (min 20 caracteres)" },
            tipo: { type: "string", enum: ["incidente", "sugerencia", "peticion", "felicitacion"] },
            emocion: { type: "string", description: "Emoji que representa la emoción (ej: 😊, 😠, 😐)" },
            area: { type: "string", description: "Área asignada (ej: ti_soporte, bienestar universitario, financiero)" },
            imagen_base64: { type: "string", description: "Imagen en base64 (opcional)" },
            imagen_nombre: { type: "string", description: "Nombre original del archivo" },
            imagen_tipo: { type: "string", description: "MIME type del archivo" },
          },
          required: ["descripcion", "tipo", "emocion", "area"],
        },
      },
      {
        name: "login",
        description: "Inicia sesión con correo institucional.",
        inputSchema: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
      },
      {
        name: "login_cedula",
        description: "Inicia sesión usando cédula y contraseña de estudiante.",
        inputSchema: {
          type: "object",
          properties: {
            cedula: { type: "string" },
            password: { type: "string" },
          },
          required: ["cedula", "password"],
        },
      },
      {
        name: "login_email_admin",
        description: "Inicia sesión para personal administrativo.",
        inputSchema: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
      },
      {
        name: "obtener_detalle_reporte",
        description: "Obtiene el detalle de un reporte mediante su ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID del reporte" },
          },
          required: ["id"],
        },
      }
    ],
  };
});

/**
 * Manejador de Ejecución de Herramientas
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "listar_reportes") {
      requireAuthToken();
      const response = await axios.get(`${API_BASE_URL}`, getAxiosConfig({ params: args }));
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "crear_reporte") {
      requireAuthToken();
      
      const payload = {
        descripcion: args?.descripcion,
        tipo: args?.tipo || args?.categoria,
        emocion: args?.emocion,
        area: args?.area,
        imagen_base64: args?.imagen_base64,
        imagen_nombre: args?.imagen_nombre,
        imagen_tipo: args?.imagen_tipo,
      };

      const response = await axios.post(
        `${API_BASE_URL}`,
        payload,
        getAxiosConfig({ headers: { 'Content-Type': 'application/json' } })
      );

      return {
        content: [{ type: "text", text: `Reporte creado exitosamente: ${JSON.stringify(response.data)}` }],
      };
    }

    if (name === "obtener_detalle_reporte") {
      requireAuthToken();
      const response = await axios.get(`${API_BASE_URL}/${args?.id}`, getAxiosConfig());
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    // Lógica unificada de Login para extraer el token dinámicamente
    if (name === "login" || name === "login_cedula" || name === "login_email_admin") {
      let endpoint = `${API_AUTH_BASE_URL}/login`;
      let body: Record<string, any> = { email: args?.email, password: args?.password };

      if (name === "login_cedula") {
        endpoint = `${API_AUTH_BASE_URL}/login-cedula`;
        body = { cedula: args?.cedula, password: args?.password };
      } else if (name === "login_email_admin") {
        endpoint = `${API_AUTH_BASE_URL}/login-email-admin`;
      }

      const response = await axios.post(endpoint, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Extrae el token sin importar la propiedad que use el backend (token, accessToken, data.token)
      storedBearerToken =
        response.data?.token ||
        response.data?.tempToken ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        "";

      if (!storedBearerToken) {
        throw new Error("El backend no devolvió ningún token válido en la respuesta.");
      }

      return {
        content: [{ type: "text", text: `Login exitoso con ${name}. Token guardado correctamente.` }],
      };
    }

    throw new Error(`Herramienta no encontrada: ${name}`);
  } catch (error: any) {
    const axiosResponse = error.response;
    const message = axiosResponse
      ? `Request failed with status ${axiosResponse.status}: ${axiosResponse.statusText} - ${JSON.stringify(axiosResponse.data)}`
      : error.message;

    return {
      isError: true,
      content: [{ type: "text", text: `Error al ejecutar la herramienta: ${message}` }],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP de UIDE Escucha ejecutándose correctamente.");
}

run().catch((error) => console.error("Error crítico en el servidor MCP:", error));