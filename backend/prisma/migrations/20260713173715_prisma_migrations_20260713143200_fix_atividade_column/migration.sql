-- AlterTable
ALTER TABLE "Atividade" ADD COLUMN     "explicacao" TEXT;

-- CreateTable
CREATE TABLE "ProgressoConteudo" (
    "progresso_id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "conteudo_id" INTEGER NOT NULL,
    "data_conclusao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressoConteudo_pkey" PRIMARY KEY ("progresso_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoConteudo_aluno_id_conteudo_id_key" ON "ProgressoConteudo"("aluno_id", "conteudo_id");

-- AddForeignKey
ALTER TABLE "ProgressoConteudo" ADD CONSTRAINT "ProgressoConteudo_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoConteudo" ADD CONSTRAINT "ProgressoConteudo_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "Conteudo"("conteudo_id") ON DELETE CASCADE ON UPDATE CASCADE;
