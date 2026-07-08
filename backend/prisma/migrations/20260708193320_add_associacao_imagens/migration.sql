-- CreateTable
CREATE TABLE "AssociacaoImagens" (
    "associacao_id" SERIAL NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "AssociacaoImagens_pkey" PRIMARY KEY ("associacao_id")
);

-- CreateTable
CREATE TABLE "ItemAssociacao" (
    "item_associacao_id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "texto" TEXT,
    "imagem_url" TEXT,
    "lado" TEXT NOT NULL,
    "associacao_id" INTEGER NOT NULL,

    CONSTRAINT "ItemAssociacao_pkey" PRIMARY KEY ("item_associacao_id")
);

-- CreateTable
CREATE TABLE "AssociacaoCorreta" (
    "item_1_id" INTEGER NOT NULL,
    "item_2_id" INTEGER NOT NULL,

    CONSTRAINT "AssociacaoCorreta_pkey" PRIMARY KEY ("item_1_id","item_2_id")
);

-- CreateTable
CREATE TABLE "TentativaAssociacao" (
    "tentativa_associacao_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "associacao_id" INTEGER NOT NULL,
    "data_tentativa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaAssociacao_pkey" PRIMARY KEY ("tentativa_associacao_id")
);

-- CreateTable
CREATE TABLE "RespostaAssociacao" (
    "tentativa_associacao_id" INTEGER NOT NULL,
    "item_1_id" INTEGER NOT NULL,
    "item_2_id" INTEGER NOT NULL,

    CONSTRAINT "RespostaAssociacao_pkey" PRIMARY KEY ("tentativa_associacao_id","item_1_id","item_2_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssociacaoImagens_atividade_id_key" ON "AssociacaoImagens"("atividade_id");

-- AddForeignKey
ALTER TABLE "AssociacaoImagens" ADD CONSTRAINT "AssociacaoImagens_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "Atividade"("atividade_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAssociacao" ADD CONSTRAINT "ItemAssociacao_associacao_id_fkey" FOREIGN KEY ("associacao_id") REFERENCES "AssociacaoImagens"("associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociacaoCorreta" ADD CONSTRAINT "AssociacaoCorreta_item_1_id_fkey" FOREIGN KEY ("item_1_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociacaoCorreta" ADD CONSTRAINT "AssociacaoCorreta_item_2_id_fkey" FOREIGN KEY ("item_2_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TentativaAssociacao" ADD CONSTRAINT "TentativaAssociacao_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TentativaAssociacao" ADD CONSTRAINT "TentativaAssociacao_associacao_id_fkey" FOREIGN KEY ("associacao_id") REFERENCES "AssociacaoImagens"("associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_tentativa_associacao_id_fkey" FOREIGN KEY ("tentativa_associacao_id") REFERENCES "TentativaAssociacao"("tentativa_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_item_1_id_fkey" FOREIGN KEY ("item_1_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_item_2_id_fkey" FOREIGN KEY ("item_2_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;
