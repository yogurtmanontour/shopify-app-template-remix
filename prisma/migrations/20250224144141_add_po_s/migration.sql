/*
  Warnings:

  - Added the required column `PurchaseItemID` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "InvoiceURL" TEXT NOT NULL,
    "DatePaid" DATETIME,
    "DateReceived" DATETIME
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PurchaseorderID" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Cost" REAL NOT NULL,
    CONSTRAINT "PurchaseItem_PurchaseorderID_fkey" FOREIGN KEY ("PurchaseorderID") REFERENCES "PurchaseOrder" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "ID" TEXT NOT NULL PRIMARY KEY,
    "PurchaseItemID" INTEGER NOT NULL,
    "Shop" TEXT NOT NULL,
    "ProductID" TEXT NOT NULL,
    "ProductVariantID" TEXT NOT NULL,
    "ProductHandle" TEXT NOT NULL,
    "SerialNumber" TEXT NOT NULL,
    CONSTRAINT "Item_PurchaseItemID_fkey" FOREIGN KEY ("PurchaseItemID") REFERENCES "PurchaseItem" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("ID", "ProductHandle", "ProductID", "ProductVariantID", "SerialNumber", "Shop") SELECT "ID", "ProductHandle", "ProductID", "ProductVariantID", "SerialNumber", "Shop" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
