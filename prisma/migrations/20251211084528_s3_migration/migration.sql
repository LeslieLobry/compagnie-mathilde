-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "storageKey" TEXT;

-- AlterTable
ALTER TABLE "SpectaclePhoto" ADD COLUMN "storageKey" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroText" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroImageKey" TEXT
);
INSERT INTO "new_SiteSettings" ("heroImage", "heroSubtitle", "heroText", "heroTitle", "id") SELECT "heroImage", "heroSubtitle", "heroText", "heroTitle", "id" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
