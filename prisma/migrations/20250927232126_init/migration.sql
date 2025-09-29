-- CreateTable
CREATE TABLE "public"."pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "user_id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sala" (
    "id" TEXT NOT NULL,
    "codigo" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "criado_por" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_alteracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participantesSala" (
    "id" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "adicionado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participantesSala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."votos" (
    "id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "historia_id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "votos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."historia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "criado_por" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_alteracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sala_codigo_key" ON "public"."sala"("codigo");

-- CreateIndex
CREATE INDEX "participantesSala_sala_id_idx" ON "public"."participantesSala"("sala_id");

-- CreateIndex
CREATE INDEX "participantesSala_pessoa_id_idx" ON "public"."participantesSala"("pessoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "participantesSala_sala_id_pessoa_id_key" ON "public"."participantesSala"("sala_id", "pessoa_id");

-- CreateIndex
CREATE INDEX "votos_sala_id_idx" ON "public"."votos"("sala_id");

-- CreateIndex
CREATE INDEX "votos_historia_id_idx" ON "public"."votos"("historia_id");

-- CreateIndex
CREATE INDEX "votos_pessoa_id_idx" ON "public"."votos"("pessoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "votos_sala_id_historia_id_pessoa_id_key" ON "public"."votos"("sala_id", "historia_id", "pessoa_id");

-- CreateIndex
CREATE INDEX "historia_sala_id_idx" ON "public"."historia"("sala_id");

-- AddForeignKey
ALTER TABLE "public"."sala" ADD CONSTRAINT "sala_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participantesSala" ADD CONSTRAINT "participantesSala_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participantesSala" ADD CONSTRAINT "participantesSala_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "public"."sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos" ADD CONSTRAINT "votos_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "public"."historia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos" ADD CONSTRAINT "votos_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos" ADD CONSTRAINT "votos_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "public"."sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historia" ADD CONSTRAINT "historia_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historia" ADD CONSTRAINT "historia_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "public"."sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
