-- CreateTable
CREATE TABLE "ComentarioAluno" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "conteudoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComentarioAluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComentarioAluno_alunoId_conteudoId_key" ON "ComentarioAluno"("alunoId", "conteudoId");

-- AddForeignKey
ALTER TABLE "ComentarioAluno" ADD CONSTRAINT "ComentarioAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioAluno" ADD CONSTRAINT "ComentarioAluno_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "Conteudo"("conteudo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
