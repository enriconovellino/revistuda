-- AlterTable
ALTER TABLE "User" ADD COLUMN     "turma_id" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("turma_id") ON DELETE SET NULL ON UPDATE CASCADE;
