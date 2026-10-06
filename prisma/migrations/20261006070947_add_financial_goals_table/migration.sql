-- CreateTable
CREATE TABLE "financial_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "target_amount" DECIMAL(15,2) NOT NULL,
    "target_date" DATE,
    "current_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_goal_contributions" (
    "id" UUID NOT NULL,
    "financial_goal_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "contribution_date" DATE NOT NULL,
    "transaction_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_goal_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_goals_user_id_status_idx" ON "financial_goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "financial_goal_contributions_financial_goal_id_contribution_idx" ON "financial_goal_contributions"("financial_goal_id", "contribution_date");

-- AddForeignKey
ALTER TABLE "financial_goals" ADD CONSTRAINT "financial_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goal_contributions" ADD CONSTRAINT "financial_goal_contributions_financial_goal_id_fkey" FOREIGN KEY ("financial_goal_id") REFERENCES "financial_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goal_contributions" ADD CONSTRAINT "financial_goal_contributions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
