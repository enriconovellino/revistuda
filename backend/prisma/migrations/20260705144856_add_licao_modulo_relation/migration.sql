-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_professor_id_fkey";

-- AlterTable
ALTER TABLE "Turma" ALTER COLUMN "professor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licao" ADD CONSTRAINT "Licao_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "Modulo"("modulo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
