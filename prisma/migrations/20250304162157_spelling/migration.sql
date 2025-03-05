/*
  Warnings:

  - You are about to drop the column `PurchaseorderID` on the `PurchaseItem` table. All the data in the column will be lost.
  - Added the required column `PurchaseOrderID` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseItem" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PurchaseOrderID" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Cost" REAL NOT NULL,
    CONSTRAINT "PurchaseItem_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrder" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseItem" ("Cost", "ID", "Title") SELECT "Cost", "ID", "Title" FROM "PurchaseItem";
DROP TABLE "PurchaseItem";
ALTER TABLE "new_PurchaseItem" RENAME TO "PurchaseItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
