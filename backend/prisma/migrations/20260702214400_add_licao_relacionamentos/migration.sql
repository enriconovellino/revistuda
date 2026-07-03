-- AlterTable
ALTER TABLE "Conteudo" ADD COLUMN     "licao_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Conteudo" ADD CONSTRAINT "Conteudo_licao_id_fkey" FOREIGN KEY ("licao_id") REFERENCES "Licao"("licao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_licao_id_fkey" FOREIGN KEY ("licao_id") REFERENCES "Licao"("licao_id") ON DELETE RESTRICT ON UPDATE CASCADE;
