-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('Available', 'Sold');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "ID" INTEGER NOT NULL,
    "PurchaseItemID" INTEGER NOT NULL,
    "FulfillmentRecordID" INTEGER,
    "ProductID" TEXT NOT NULL,
    "ProductVariantID" TEXT NOT NULL,
    "ProductHandle" TEXT NOT NULL,
    "ProductTitle" TEXT NOT NULL,
    "ProductImage" TEXT NOT NULL,
    "ProductAlt" TEXT NOT NULL,
    "SerialNumber" TEXT NOT NULL,
    "Status" "ItemStatus" NOT NULL DEFAULT 'Available',

    CONSTRAINT "Item_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "ID" SERIAL NOT NULL,
    "Description" TEXT,
    "InvoiceURL" TEXT NOT NULL,
    "HasPaid" BOOLEAN NOT NULL DEFAULT false,
    "DatePaid" TIMESTAMP(3),
    "HasReceived" BOOLEAN NOT NULL DEFAULT false,
    "DateReceived" TIMESTAMP(3),

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "ID" SERIAL NOT NULL,
    "PurchaseOrderID" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseCost" (
    "ID" SERIAL NOT NULL,
    "PurchaseOrderID" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Rate" DOUBLE PRECISION NOT NULL,
    "Cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PurchaseCost_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "FulfillmentRecord" (
    "ID" SERIAL NOT NULL,
    "FulfillmentOrderID" TEXT NOT NULL,

    CONSTRAINT "FulfillmentRecord_pkey" PRIMARY KEY ("ID")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_PurchaseItemID_fkey" FOREIGN KEY ("PurchaseItemID") REFERENCES "PurchaseItem"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_FulfillmentRecordID_fkey" FOREIGN KEY ("FulfillmentRecordID") REFERENCES "FulfillmentRecord"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrder"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCost" ADD CONSTRAINT "PurchaseCost_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrder"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
