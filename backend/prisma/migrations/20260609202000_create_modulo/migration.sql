-- CreateTable
CREATE TABLE "Modulo" (
    "modulo_id" SERIAL NOT NULL,
    "titulo_modulo" TEXT NOT NULL,
    "descricao_modulo" TEXT,
    "dificuldade" TEXT NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("modulo_id")
);
