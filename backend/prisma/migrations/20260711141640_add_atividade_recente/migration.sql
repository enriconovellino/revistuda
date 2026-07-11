-- CreateTable
CREATE TABLE "AtividadeRecente" (
    "atividade_recente_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtividadeRecente_pkey" PRIMARY KEY ("atividade_recente_id")
);
