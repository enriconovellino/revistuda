/*
  Warnings:

  - You are about to drop the column `dados_atividade` on the `Atividade` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Atividade" DROP CONSTRAINT "Atividade_licao_id_fkey";

-- AlterTable
ALTER TABLE "Atividade" DROP COLUMN "dados_atividade",
ADD COLUMN     "enunciado" TEXT;

-- CreateTable
CREATE TABLE "Opcao" (
    "opcao_id" SERIAL NOT NULL,
    "texto_opcao" TEXT NOT NULL,
    "letra" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "Opcao_pkey" PRIMARY KEY ("opcao_id")
);

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_licao_id_fkey" FOREIGN KEY ("licao_id") REFERENCES "Licao"("licao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcao" ADD CONSTRAINT "Opcao_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "Atividade"("atividade_id") ON DELETE CASCADE ON UPDATE CASCADE;
