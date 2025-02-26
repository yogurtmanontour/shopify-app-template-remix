/*
  Warnings:

  - Added the required column `ProductHandle` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "ID" TEXT NOT NULL PRIMARY KEY,
    "Shop" TEXT NOT NULL,
    "ProductID" TEXT NOT NULL,
    "ProductVariantID" TEXT NOT NULL,
    "ProductHandle" TEXT NOT NULL,
    "SerialNumber" TEXT NOT NULL
);
INSERT INTO "new_Item" ("ID", "ProductID", "ProductVariantID", "SerialNumber", "Shop") SELECT "ID", "ProductID", "ProductVariantID", "SerialNumber", "Shop" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
