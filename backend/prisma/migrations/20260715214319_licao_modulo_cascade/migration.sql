-- DropForeignKey
ALTER TABLE "Licao" DROP CONSTRAINT "Licao_modulo_id_fkey";

-- AddForeignKey
ALTER TABLE "Licao" ADD CONSTRAINT "Licao_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "Modulo"("modulo_id") ON DELETE CASCADE ON UPDATE CASCADE;
