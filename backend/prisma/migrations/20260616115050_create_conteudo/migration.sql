-- CreateTable
CREATE TABLE "Conteudo" (
    "conteudo_id" SERIAL NOT NULL,
    "nome_conteudo" TEXT NOT NULL,
    "tipo_conteudo" TEXT NOT NULL,
    "video_url" TEXT,
    "audio_link" TEXT,
    "texto_conteudo" TEXT,

    CONSTRAINT "Conteudo_pkey" PRIMARY KEY ("conteudo_id")
);
