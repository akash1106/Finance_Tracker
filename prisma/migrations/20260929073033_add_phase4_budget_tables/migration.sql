-- CreateTable
CREATE TABLE "budget_templates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_template_items" (
    "id" UUID NOT NULL,
    "budget_template_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "budget_template_id" UUID NOT NULL,
    "income_transaction_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "allocated_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_budget_items" (
    "id" UUID NOT NULL,
    "monthly_budget_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "allocated_amount" DECIMAL(15,2) NOT NULL,
    "spent_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "percentage" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_templates_user_id_idx" ON "budget_templates"("user_id");

-- CreateIndex
CREATE INDEX "budget_template_items_category_id_idx" ON "budget_template_items"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_template_items_budget_template_id_category_id_key" ON "budget_template_items"("budget_template_id", "category_id");

-- CreateIndex
CREATE INDEX "monthly_budgets_user_id_year_month_idx" ON "monthly_budgets"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_budgets_user_id_year_month_key" ON "monthly_budgets"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "monthly_budget_items_category_id_idx" ON "monthly_budget_items"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_budget_items_monthly_budget_id_category_id_key" ON "monthly_budget_items"("monthly_budget_id", "category_id");

-- AddForeignKey
ALTER TABLE "budget_templates" ADD CONSTRAINT "budget_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_template_items" ADD CONSTRAINT "budget_template_items_budget_template_id_fkey" FOREIGN KEY ("budget_template_id") REFERENCES "budget_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_template_items" ADD CONSTRAINT "budget_template_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_budgets" ADD CONSTRAINT "monthly_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_budgets" ADD CONSTRAINT "monthly_budgets_budget_template_id_fkey" FOREIGN KEY ("budget_template_id") REFERENCES "budget_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_budgets" ADD CONSTRAINT "monthly_budgets_income_transaction_id_fkey" FOREIGN KEY ("income_transaction_id") REFERENCES "income_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_budget_items" ADD CONSTRAINT "monthly_budget_items_monthly_budget_id_fkey" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_budget_items" ADD CONSTRAINT "monthly_budget_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
