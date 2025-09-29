-- AlterTable
ALTER TABLE "public"."pessoa" ADD COLUMN     "inativo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."sala" ADD COLUMN     "inativo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."equipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inativo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membroEquipe" (
    "id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "proprietario" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "membroEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "inativo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projetoParticipante" (
    "id" TEXT NOT NULL,
    "projeto_id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "role" INTEGER NOT NULL,

    CONSTRAINT "projetoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membroEquipe_pessoa_id_equipe_id_key" ON "public"."membroEquipe"("pessoa_id", "equipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "projetoParticipante_projeto_id_pessoa_id_key" ON "public"."projetoParticipante"("projeto_id", "pessoa_id");

-- AddForeignKey
ALTER TABLE "public"."membroEquipe" ADD CONSTRAINT "membroEquipe_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membroEquipe" ADD CONSTRAINT "membroEquipe_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projeto" ADD CONSTRAINT "projeto_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projetoParticipante" ADD CONSTRAINT "projetoParticipante_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "public"."projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projetoParticipante" ADD CONSTRAINT "projetoParticipante_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
