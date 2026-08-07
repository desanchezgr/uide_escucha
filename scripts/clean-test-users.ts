import { sql } from '../server/src/config/database';

const PREFIX = 'test_';

async function clean() {
  console.log('🧹 Limpiando usuarios de prueba...');

  const testUsers = await sql`
    SELECT usuario_id, cedula, nombres FROM usuarios
    WHERE nombres LIKE ${PREFIX + '%'} OR cedula LIKE ${PREFIX + '%'}
  `;

  if (testUsers.length === 0) {
    console.log('✅ No hay usuarios de prueba para limpiar.');
    process.exit(0);
  }

  console.log(`🗑️  ${testUsers.length} usuarios de prueba encontrados.`);

  const userIds = testUsers.map(u => u.usuario_id);

  for (const id of userIds) {
    try {
      await sql`DELETE FROM comentarios WHERE usuario_id = ${id}`;
      await sql`DELETE FROM notificaciones WHERE usuario_id = ${id}`;
      await sql`DELETE FROM mfa_config WHERE usuario_id = ${id}`;
      await sql`DELETE FROM autenticacion WHERE usuario_id = ${id}`;
    } catch (err: any) {
      console.log(`  ⚠️ Error limpiando usuario ${id}: ${err.message}`);
    }
  }

  for (const user of testUsers) {
    try {
      const reportes = await sql`SELECT reporte_id FROM reportes WHERE solicitado_por = ${user.usuario_id}`;
      for (const r of reportes) {
        await sql`DELETE FROM archivos_reporte WHERE reporte_id = ${r.reporte_id}`;
        await sql`DELETE FROM comentarios WHERE reporte_id = ${r.reporte_id}`;
      }
      await sql`DELETE FROM reportes WHERE solicitado_por = ${user.usuario_id}`;
      await sql`DELETE FROM usuarios WHERE usuario_id = ${user.usuario_id}`;
      console.log(`  ✓ Eliminado: ${user.cedula} (${user.nombres})`);
    } catch (err: any) {
      console.log(`  ✗ Error eliminando ${user.cedula}: ${err.message}`);
    }
  }

  console.log('');
  console.log('✅ DB limpia. Todos los datos de prueba eliminados.');
}

clean().catch(console.error).then(() => process.exit(0));
