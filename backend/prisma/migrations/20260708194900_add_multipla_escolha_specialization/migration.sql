/*
  Warnings:

  - You are about to drop the column `atividade_id` on the `Opcao` table. All the data in the column will be lost.
  - Added the required column `multipla_escolha_id` to the `Opcao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Opcao" DROP CONSTRAINT "Opcao_atividade_id_fkey";

-- AlterTable
ALTER TABLE "Opcao" DROP COLUMN "atividade_id",
ADD COLUMN     "multipla_escolha_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MultiplaEscolha" (
    "multipla_escolha_id" SERIAL NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "MultiplaEscolha_pkey" PRIMARY KEY ("multipla_escolha_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MultiplaEscolha_atividade_id_key" ON "MultiplaEscolha"("atividade_id");

-- AddForeignKey
ALTER TABLE "MultiplaEscolha" ADD CONSTRAINT "MultiplaEscolha_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "Atividade"("atividade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcao" ADD CONSTRAINT "Opcao_multipla_escolha_id_fkey" FOREIGN KEY ("multipla_escolha_id") REFERENCES "MultiplaEscolha"("multipla_escolha_id") ON DELETE CASCADE ON UPDATE CASCADE;
