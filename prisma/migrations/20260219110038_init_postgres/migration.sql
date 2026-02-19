-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sign" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Markup" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Markup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penalty" (
    "id" TEXT NOT NULL,
    "articlePart" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "penalty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "score" INTEGER,
    "mistakesCount" INTEGER,
    "durationSec" INTEGER,
    "maxMistakes" INTEGER,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "SessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerLog" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "AnswerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

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

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "SessionQuestion_sessionId_idx" ON "SessionQuestion"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionQuestion_sessionId_questionId_key" ON "SessionQuestion"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "AnswerLog_sessionId_idx" ON "AnswerLog"("sessionId");

-- CreateIndex
CREATE INDEX "AnswerLog_questionId_idx" ON "AnswerLog"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionTopics_AB_unique" ON "_QuestionTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionTopics_B_index" ON "_QuestionTopics"("B");

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionTopics" ADD CONSTRAINT "_QuestionTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionTopics" ADD CONSTRAINT "_QuestionTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
