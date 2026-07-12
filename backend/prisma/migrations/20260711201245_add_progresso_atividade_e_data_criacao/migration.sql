-- AlterTable
ALTER TABLE "Atividade" ADD COLUMN     "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ProgressoAtividade" (
    "progresso_id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "atividade_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),

    CONSTRAINT "ProgressoAtividade_pkey" PRIMARY KEY ("progresso_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressoAtividade_aluno_id_atividade_id_key" ON "ProgressoAtividade"("aluno_id", "atividade_id");

-- AddForeignKey
ALTER TABLE "ProgressoAtividade" ADD CONSTRAINT "ProgressoAtividade_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressoAtividade" ADD CONSTRAINT "ProgressoAtividade_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "Atividade"("atividade_id") ON DELETE CASCADE ON UPDATE CASCADE;
