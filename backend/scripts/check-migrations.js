const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function checkMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Erro: Variável DATABASE_URL não encontrada no arquivo .env.');
    process.exit(1);
  }

  // 1. Obter migrations locais
  const migrationsPath = path.join(__dirname, '../prisma/migrations');
  if (!fs.existsSync(migrationsPath)) {
    console.log('Nenhuma migration encontrada na pasta prisma/migrations.');
    return;
  }

  const localMigrations = fs.readdirSync(migrationsPath)
    .filter(file => {
      const fullPath = path.join(migrationsPath, file);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'migration.sql'));
    })
    .sort();

  if (localMigrations.length === 0) {
    console.log('Nenhuma migration local encontrada.');
    return;
  }

  // 2. Obter migrations aplicadas no banco
  const pool = new Pool({ connectionString });
  let appliedMigrations = new Set();

  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (tableExists) {
      const res = await pool.query(`
        SELECT migration_name FROM public._prisma_migrations 
        WHERE finished_at IS NOT NULL;
      `);
      res.rows.forEach(row => {
        appliedMigrations.add(row.migration_name);
      });
    }
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados ou ler tabela de migrações:', err.message);
    await pool.end();
    process.exit(1);
  }

  await pool.end();

  // 3. Exibir o status formatado
  console.log('\n=== Status das Migrations (Banco Local) ===\n');
  localMigrations.forEach(migration => {
    const isApplied = appliedMigrations.has(migration);
    const statusIcon = isApplied ? '\x1b[32m[x]\x1b[0m' : '\x1b[31m[ ]\x1b[0m'; // Verde para [x], Vermelho para [ ]
    console.log(`${statusIcon} ${migration}`);
  });
  console.log('\n===========================================\n');
}

checkMigrations();
