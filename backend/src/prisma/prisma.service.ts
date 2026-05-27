import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient }  from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // pega a url do banco de dados do .env
    const connectionString = process.env.DATABASE_URL;

    // cria uma nova conexão com o banco de dados usando o Pool do pg
    const pool = new Pool({ connectionString });

    // cria um novo adaptador do Prisma para o PostgreSQL usando a conexão do Pool
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }
  
  async onModuleInit() {
    await this.$connect();
  }
}