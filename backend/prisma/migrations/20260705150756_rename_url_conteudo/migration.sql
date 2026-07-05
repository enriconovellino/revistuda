-- AlterTable
ALTER TABLE "Conteudo" DROP COLUMN "audio_link",
DROP COLUMN "video_url",
ADD COLUMN     "url_conteudo" TEXT;
