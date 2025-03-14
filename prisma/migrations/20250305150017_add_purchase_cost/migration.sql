-- CreateTable
CREATE TABLE "PurchaseCost" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PurchaseOrderID" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Rate" REAL NOT NULL,
    "Cost" REAL NOT NULL,
    CONSTRAINT "PurchaseCost_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrder" ("ID") ON DELETE RESTRICT ON UPDATE CASCADE
);
