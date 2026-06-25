const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { execSync } = require('child_process');
require('dotenv').config();

async function runMigrations() {
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
  let hasPending = false;

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
    } else {
      hasPending = true;
    }
  } catch (err) {
    hasPending = true;
  }

  await pool.end();

  if (!hasPending) {
    for (const migration of localMigrations) {
      if (!appliedMigrations.has(migration)) {
        hasPending = true;
        break;
      }
    }
  }

  if (hasPending) {
    console.log('\n🚀 Detectadas migrations pendentes. Executando "prisma migrate deploy"...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('\n✅ Migrations executadas com sucesso!\n');
    } catch (error) {
      console.error('\n❌ Erro ao executar as migrations:', error.message);
      process.exit(1);
    }
  } else {
    console.log('\n✅ Banco de dados já está atualizado. Nenhuma migration pendente detectada.\n');
  }
}

runMigrations();
