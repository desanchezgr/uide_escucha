import { sql } from '../server/src/config/database';
import bcrypt from 'bcrypt';

const TEST_PASSWORD = 'Test1234!';
const TEST_COUNT = 30;
const PREFIX = 'test_';

async function seed() {
  console.log('🌱 Obteniendo estudiantes reales de la DB...');

  const estudiantes = await sql`
    SELECT cedula, nombres FROM estudiantes_habilitados
    WHERE cedula NOT IN (
      SELECT cedula FROM usuarios WHERE cedula IS NOT NULL AND nombres LIKE ${PREFIX + '%'}
    )
    LIMIT ${TEST_COUNT}
  `;

  if (estudiantes.length === 0) {
    console.log('❌ No hay estudiantes disponibles sin cuenta. Verifica la tabla estudiantes_habilitados.');
    process.exit(1);
  }

  console.log(`✅ ${estudiantes.length} estudiantes encontrados.`);
  console.log(`🔐 Password para todos: ${TEST_PASSWORD}`);
  console.log('');

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  const created: { cedula: string; nombre: string; id: number }[] = [];

  for (const est of estudiantes) {
    try {
      const testCedula = `${PREFIX}${est.cedula}`;
      const testNombre = `${PREFIX}${est.nombres}`;

      const existente = await sql`SELECT usuario_id FROM usuarios WHERE cedula = ${testCedula}`;
      let usuarioId: number;

      if (existente.length > 0) {
        usuarioId = existente[0].usuario_id;
      } else {
        const result = await sql`
          INSERT INTO usuarios (sede_id, nombres, apellidos, cedula, rol)
          VALUES (1, ${testNombre}, '', ${testCedula}, 'estudiante')
          RETURNING usuario_id
        `;
        usuarioId = result[0].usuario_id;
      }

      await sql`
        INSERT INTO autenticacion (usuario_id, email_institucional, password)
        VALUES (${usuarioId}, ${testCedula}@cedula.uide.edu.ec, ${hashedPassword})
        ON CONFLICT (usuario_id) DO UPDATE SET password = ${hashedPassword}
      `;

      created.push({ cedula: testCedula, nombre: testNombre, id: usuarioId });
      console.log(`  ✓ ${testCedula} → usuario_id=${usuarioId}`);
    } catch (err: any) {
      console.log(`  ✗ Error con ${est.cedula}: ${err.message}`);
    }
  }

  console.log('');
  console.log(`🎉 ${created.length} usuarios de prueba creados.`);
  console.log('');
  console.log('📋 Copia estas cédulas para el script de load test:');
  const cedulasArray = created.map(c => c.cedula);
  console.log(JSON.stringify(cedulasArray, null, 2));
  console.log('');
  console.log(`🧹 Para limpiar después: npx tsx scripts/clean-test-users.ts`);
}

seed().catch(console.error).then(() => process.exit(0));
