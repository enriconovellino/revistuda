-- CreateTable
CREATE TABLE "Turma" (
    "turma_id" SERIAL NOT NULL,
    "nome_turma" TEXT NOT NULL,
    "descricao_turma" TEXT,
    "capacidade_maxima" INTEGER,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("turma_id")
);
