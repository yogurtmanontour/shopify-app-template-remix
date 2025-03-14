/*
  Warnings:

  - Added the required column `Description` to the `PurchaseCost` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseCost" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PurchaseOrderID" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Rate" REAL NOT NULL,
    "Cost" REAL NOT NULL,
    CONSTRAINT "PurchaseCost_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrder" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseCost" ("Cost", "ID", "PurchaseOrderID", "Rate", "Type") SELECT "Cost", "ID", "PurchaseOrderID", "Rate", "Type" FROM "PurchaseCost";
DROP TABLE "PurchaseCost";
ALTER TABLE "new_PurchaseCost" RENAME TO "PurchaseCost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
