-- CreateTable
CREATE TABLE "RespostaMultiplaEscolha" (
    "resposta_me_id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "resposta_aluno_id" INTEGER NOT NULL,
    "data_resposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RespostaMultiplaEscolha_pkey" PRIMARY KEY ("resposta_me_id")
);

-- AddForeignKey
ALTER TABLE "RespostaMultiplaEscolha" ADD CONSTRAINT "RespostaMultiplaEscolha_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaMultiplaEscolha" ADD CONSTRAINT "RespostaMultiplaEscolha_resposta_aluno_id_fkey" FOREIGN KEY ("resposta_aluno_id") REFERENCES "Opcao"("opcao_id") ON DELETE CASCADE ON UPDATE CASCADE;
