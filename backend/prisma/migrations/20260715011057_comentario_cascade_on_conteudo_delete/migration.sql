-- DropForeignKey
ALTER TABLE "ComentarioAluno" DROP CONSTRAINT "ComentarioAluno_conteudoId_fkey";

-- DropForeignKey
ALTER TABLE "Conteudo" DROP CONSTRAINT "Conteudo_licao_id_fkey";

-- AddForeignKey
ALTER TABLE "Conteudo" ADD CONSTRAINT "Conteudo_licao_id_fkey" FOREIGN KEY ("licao_id") REFERENCES "Licao"("licao_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioAluno" ADD CONSTRAINT "ComentarioAluno_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "Conteudo"("conteudo_id") ON DELETE CASCADE ON UPDATE CASCADE;
