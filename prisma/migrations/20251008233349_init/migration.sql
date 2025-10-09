-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "auth_id" TEXT NOT NULL,
    "inativo" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "inativo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroEquipe" (
    "id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "proprietario" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MembroEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "inativo" BOOLEAN NOT NULL DEFAULT false,
    "gerente_id" TEXT,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "criado_por" TEXT NOT NULL,
    "senha" TEXT,
    "inativo" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_alteracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteSala" (
    "id" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "adicionado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipanteSala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "sala_id" TEXT NOT NULL,
    "criado_por" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_alteracao" TIMESTAMP(3) NOT NULL,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Historia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" TEXT NOT NULL,
    "pessoa_id" TEXT NOT NULL,
    "sala_id" TEXT NOT NULL,
    "historia_id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "data_voto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_auth_id_key" ON "Pessoa"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "MembroEquipe_pessoa_id_equipe_id_key" ON "MembroEquipe"("pessoa_id", "equipe_id");

-- CreateIndex
CREATE INDEX "ParticipanteSala_sala_id_idx" ON "ParticipanteSala"("sala_id");

-- CreateIndex
CREATE INDEX "ParticipanteSala_pessoa_id_idx" ON "ParticipanteSala"("pessoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteSala_sala_id_pessoa_id_key" ON "ParticipanteSala"("sala_id", "pessoa_id");

-- CreateIndex
CREATE INDEX "Voto_sala_id_idx" ON "Voto"("sala_id");

-- CreateIndex
CREATE INDEX "Voto_historia_id_idx" ON "Voto"("historia_id");

-- CreateIndex
CREATE INDEX "Voto_pessoa_id_idx" ON "Voto"("pessoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "Voto_sala_id_historia_id_pessoa_id_key" ON "Voto"("sala_id", "historia_id", "pessoa_id");

-- AddForeignKey
ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "Equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "Equipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "Pessoa"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteSala" ADD CONSTRAINT "ParticipanteSala_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteSala" ADD CONSTRAINT "ParticipanteSala_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historia" ADD CONSTRAINT "Historia_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historia" ADD CONSTRAINT "Historia_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "Pessoa"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "Historia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
