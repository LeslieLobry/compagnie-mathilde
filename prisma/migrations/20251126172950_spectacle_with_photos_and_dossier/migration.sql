/*
  Warnings:

  - Added the required column `updatedAt` to the `Spectacle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SpectaclePhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "spectacleId" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "legend" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpectaclePhoto_spectacleId_fkey" FOREIGN KEY ("spectacleId") REFERENCES "Spectacle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spectacle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "texte" TEXT,
    "mes" TEXT,
    "distribution" TEXT,
    "autresInfos" TEXT,
    "dossierPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Spectacle" ("createdAt", "description", "id", "mes", "subtitle", "texte", "title") SELECT "createdAt", "description", "id", "mes", "subtitle", "texte", "title" FROM "Spectacle";
DROP TABLE "Spectacle";
ALTER TABLE "new_Spectacle" RENAME TO "Spectacle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
