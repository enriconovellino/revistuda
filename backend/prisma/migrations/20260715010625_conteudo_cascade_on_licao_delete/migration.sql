-- DropForeignKey
ALTER TABLE "Conteudo" DROP CONSTRAINT "Conteudo_licao_id_fkey";

-- AddForeignKey
ALTER TABLE "Conteudo" ADD CONSTRAINT "Conteudo_licao_id_fkey" FOREIGN KEY ("licao_id") REFERENCES "Licao"("licao_id") ON DELETE CASCADE ON UPDATE CASCADE;
