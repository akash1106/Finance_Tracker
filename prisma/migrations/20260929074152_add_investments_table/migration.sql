-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "investment_type" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_contributions" (
    "id" UUID NOT NULL,
    "investment_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "investment_date" DATE NOT NULL,
    "transaction_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investments_user_id_investment_type_idx" ON "investments"("user_id", "investment_type");

-- CreateIndex
CREATE INDEX "investment_contributions_investment_id_investment_date_idx" ON "investment_contributions"("investment_id", "investment_date");

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_contributions" ADD CONSTRAINT "investment_contributions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_contributions" ADD CONSTRAINT "investment_contributions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_contributions" ADD CONSTRAINT "investment_contributions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
