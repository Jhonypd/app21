-- DropForeignKey
ALTER TABLE "public"."projeto" DROP CONSTRAINT "projeto_equipe_id_fkey";

-- CreateTable
CREATE TABLE "_EquipeProjeto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipeProjeto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EquipeProjeto_B_index" ON "_EquipeProjeto"("B");

-- AddForeignKey
ALTER TABLE "_EquipeProjeto" ADD CONSTRAINT "_EquipeProjeto_A_fkey" FOREIGN KEY ("A") REFERENCES "equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipeProjeto" ADD CONSTRAINT "_EquipeProjeto_B_fkey" FOREIGN KEY ("B") REFERENCES "projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
