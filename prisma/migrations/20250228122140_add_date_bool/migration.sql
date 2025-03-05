-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseOrder" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "InvoiceURL" TEXT NOT NULL,
    "HasPaid" BOOLEAN NOT NULL DEFAULT false,
    "DatePaid" DATETIME,
    "HasReceived" BOOLEAN NOT NULL DEFAULT false,
    "DateReceived" DATETIME
);
INSERT INTO "new_PurchaseOrder" ("DatePaid", "DateReceived", "ID", "InvoiceURL") SELECT "DatePaid", "DateReceived", "ID", "InvoiceURL" FROM "PurchaseOrder";
DROP TABLE "PurchaseOrder";
ALTER TABLE "new_PurchaseOrder" RENAME TO "PurchaseOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
