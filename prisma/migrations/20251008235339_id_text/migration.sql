-- DropForeignKey
ALTER TABLE "public"."Historia" DROP CONSTRAINT "Historia_criado_por_fkey";

-- DropForeignKey
ALTER TABLE "public"."MembroEquipe" DROP CONSTRAINT "MembroEquipe_pessoa_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ParticipanteSala" DROP CONSTRAINT "ParticipanteSala_pessoa_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sala" DROP CONSTRAINT "Sala_criado_por_fkey";

-- DropForeignKey
ALTER TABLE "public"."Voto" DROP CONSTRAINT "Voto_pessoa_id_fkey";

-- AddForeignKey
ALTER TABLE "MembroEquipe" ADD CONSTRAINT "MembroEquipe_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteSala" ADD CONSTRAINT "ParticipanteSala_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historia" ADD CONSTRAINT "Historia_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
