-- CreateTable
CREATE TABLE "Atividade" (
    "atividade_id" SERIAL NOT NULL,
    "titulo_atividade" TEXT NOT NULL,
    "descricao_atividade" TEXT,
    "tipo_atividade" TEXT NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("atividade_id")
);
