/*
  Warnings:

  - Added the required column `ProductAlt` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductImage` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductTitle` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PurchaseItemID" INTEGER NOT NULL,
    "ProductID" TEXT NOT NULL,
    "ProductVariantID" TEXT NOT NULL,
    "ProductHandle" TEXT NOT NULL,
    "ProductTitle" TEXT NOT NULL,
    "ProductImage" TEXT NOT NULL,
    "ProductAlt" TEXT NOT NULL,
    "SerialNumber" TEXT NOT NULL,
    CONSTRAINT "Item_PurchaseItemID_fkey" FOREIGN KEY ("PurchaseItemID") REFERENCES "PurchaseItem" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("ID", "ProductHandle", "ProductID", "ProductVariantID", "PurchaseItemID", "SerialNumber") SELECT "ID", "ProductHandle", "ProductID", "ProductVariantID", "PurchaseItemID", "SerialNumber" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
