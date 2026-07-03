-- AlterTable
ALTER TABLE "Modulo" ADD COLUMN     "turma_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "professor_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("turma_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
