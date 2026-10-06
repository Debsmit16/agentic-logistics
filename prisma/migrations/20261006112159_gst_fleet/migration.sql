-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('TAX_INVOICE', 'BILL_OF_SUPPLY');

-- CreateTable
CREATE TABLE "FleetGpsPing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracyM" DOUBLE PRECISION,
    "speedKmh" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetGpsPing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "parcelId" TEXT,
    "partnerId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "invoiceType" "InvoiceType" NOT NULL DEFAULT 'TAX_INVOICE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placeOfSupply" TEXT NOT NULL,
    "sellerLegalName" TEXT NOT NULL,
    "sellerGstin" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerGstin" TEXT,
    "buyerAddress" TEXT NOT NULL,
    "buyerState" TEXT NOT NULL,
    "hsnSac" TEXT NOT NULL DEFAULT '996812',
    "taxableAmount" DECIMAL(12,2) NOT NULL,
    "cgstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sgstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "igstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FleetGpsPing_userId_recordedAt_idx" ON "FleetGpsPing"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "FleetGpsPing_recordedAt_idx" ON "FleetGpsPing"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaxInvoice_invoiceNumber_key" ON "TaxInvoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaxInvoice_parcelId_key" ON "TaxInvoice"("parcelId");

-- CreateIndex
CREATE INDEX "TaxInvoice_issuedAt_idx" ON "TaxInvoice"("issuedAt");

-- CreateIndex
CREATE INDEX "TaxInvoice_status_idx" ON "TaxInvoice"("status");

-- AddForeignKey
ALTER TABLE "FleetGpsPing" ADD CONSTRAINT "FleetGpsPing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxInvoice" ADD CONSTRAINT "TaxInvoice_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxInvoice" ADD CONSTRAINT "TaxInvoice_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
