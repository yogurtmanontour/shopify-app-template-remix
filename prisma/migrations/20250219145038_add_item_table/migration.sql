-- CreateTable
CREATE TABLE "Item" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Shop" TEXT NOT NULL,
    "ProductID" TEXT NOT NULL,
    "ProductVariantID" TEXT NOT NULL,
    "SerialNumber" TEXT NOT NULL
);
