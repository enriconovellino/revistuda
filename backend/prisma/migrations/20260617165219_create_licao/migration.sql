-- CreateTable
CREATE TABLE "Licao" (
    "licao_id" SERIAL NOT NULL,
    "titulo_licao" TEXT NOT NULL,
    "comentario" TEXT,
    "modulo_id" INTEGER NOT NULL,

    CONSTRAINT "Licao_pkey" PRIMARY KEY ("licao_id")
);
