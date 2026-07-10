-- Realinha o banco ao schema.prisma atual (item_1_id / item_2_id / user_id),
-- revertendo a divergência introduzida por align_associacao_er_diagram.

-- ========== AssociacaoCorreta ==========
ALTER TABLE "AssociacaoCorreta" DROP CONSTRAINT IF EXISTS "AssociacaoCorreta_item_origem_id_fkey";
ALTER TABLE "AssociacaoCorreta" DROP CONSTRAINT IF EXISTS "AssociacaoCorreta_item_destino_id_fkey";
ALTER TABLE "AssociacaoCorreta" DROP CONSTRAINT IF EXISTS "AssociacaoCorreta_pkey";

ALTER TABLE "AssociacaoCorreta" RENAME COLUMN "item_origem_id" TO "item_1_id";
ALTER TABLE "AssociacaoCorreta" RENAME COLUMN "item_destino_id" TO "item_2_id";

ALTER TABLE "AssociacaoCorreta" DROP COLUMN IF EXISTS "associacao_correta_id";
DROP SEQUENCE IF EXISTS "AssociacaoCorreta_associacao_correta_id_seq";

ALTER TABLE "AssociacaoCorreta" ADD CONSTRAINT "AssociacaoCorreta_pkey" PRIMARY KEY ("item_1_id", "item_2_id");
ALTER TABLE "AssociacaoCorreta" ADD CONSTRAINT "AssociacaoCorreta_item_1_id_fkey" FOREIGN KEY ("item_1_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssociacaoCorreta" ADD CONSTRAINT "AssociacaoCorreta_item_2_id_fkey" FOREIGN KEY ("item_2_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== RespostaAssociacao ==========
ALTER TABLE "RespostaAssociacao" DROP CONSTRAINT IF EXISTS "RespostaAssociacao_item_origem_id_fkey";
ALTER TABLE "RespostaAssociacao" DROP CONSTRAINT IF EXISTS "RespostaAssociacao_item_destino_id_fkey";
ALTER TABLE "RespostaAssociacao" DROP CONSTRAINT IF EXISTS "RespostaAssociacao_tentativa_id_fkey";
ALTER TABLE "RespostaAssociacao" DROP CONSTRAINT IF EXISTS "RespostaAssociacao_pkey";

ALTER TABLE "RespostaAssociacao" RENAME COLUMN "item_origem_id" TO "item_1_id";
ALTER TABLE "RespostaAssociacao" RENAME COLUMN "item_destino_id" TO "item_2_id";
ALTER TABLE "RespostaAssociacao" RENAME COLUMN "tentativa_id" TO "tentativa_associacao_id";

ALTER TABLE "RespostaAssociacao" DROP COLUMN IF EXISTS "resposta_associacao_id";
DROP SEQUENCE IF EXISTS "RespostaAssociacao_resposta_associacao_id_seq";

ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_pkey" PRIMARY KEY ("tentativa_associacao_id", "item_1_id", "item_2_id");
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_tentativa_associacao_id_fkey" FOREIGN KEY ("tentativa_associacao_id") REFERENCES "TentativaAssociacao"("tentativa_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_item_1_id_fkey" FOREIGN KEY ("item_1_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RespostaAssociacao" ADD CONSTRAINT "RespostaAssociacao_item_2_id_fkey" FOREIGN KEY ("item_2_id") REFERENCES "ItemAssociacao"("item_associacao_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== TentativaAssociacao ==========
ALTER TABLE "TentativaAssociacao" DROP CONSTRAINT IF EXISTS "TentativaAssociacao_aluno_id_fkey";
ALTER TABLE "TentativaAssociacao" RENAME COLUMN "aluno_id" TO "user_id";
ALTER TABLE "TentativaAssociacao" ADD CONSTRAINT "TentativaAssociacao_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
