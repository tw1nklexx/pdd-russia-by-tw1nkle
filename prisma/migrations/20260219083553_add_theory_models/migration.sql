-- CreateTable
CREATE TABLE "Sign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Markup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Penalty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articlePart" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "penalty" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Sign_code_key" ON "Sign"("code");

-- CreateIndex
CREATE INDEX "Sign_category_idx" ON "Sign"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Markup_code_key" ON "Markup"("code");

-- CreateIndex
CREATE INDEX "Markup_category_idx" ON "Markup"("category");

-- CreateIndex
CREATE INDEX "Penalty_articlePart_idx" ON "Penalty"("articlePart");

-- CreateIndex
CREATE UNIQUE INDEX "Penalty_articlePart_text_key" ON "Penalty"("articlePart", "text");
