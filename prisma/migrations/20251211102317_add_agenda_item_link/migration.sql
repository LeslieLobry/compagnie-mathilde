/*
  Warnings:

  - Added the required column `updatedAt` to the `AgendaItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgendaItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AgendaItem" ("createdAt", "description", "id", "location", "order", "period", "title") SELECT "createdAt", "description", "id", "location", "order", "period", "title" FROM "AgendaItem";
DROP TABLE "AgendaItem";
ALTER TABLE "new_AgendaItem" RENAME TO "AgendaItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
