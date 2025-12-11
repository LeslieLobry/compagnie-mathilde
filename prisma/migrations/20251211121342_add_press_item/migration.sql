-- CreateTable
CREATE TABLE "PressItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "mediaName" TEXT NOT NULL,
    "url" TEXT,
    "quote" TEXT,
    "imageUrl" TEXT,
    "date" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
