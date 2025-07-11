-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'CASHER') NOT NULL DEFAULT 'ADMIN',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `id_card` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `measurement` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `product_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount_money` DOUBLE NOT NULL,
    `price_per_quantity` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `product_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buy_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price_per_quantity` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `payment_method` ENUM('CASH', 'BANK', 'CREDIT') NOT NULL,
    `total_money` DOUBLE NOT NULL,
    `supplier_name` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type_id` INTEGER NOT NULL,
    `bank_id` INTEGER NULL,
    `return_date` DATETIME(3) NULL,

    INDEX `buy_transaction_price_per_quantity_transaction_id_idx`(`price_per_quantity`, `transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buy_credit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NOT NULL,
    `total_money` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `issued_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `return_date` DATETIME(3) NOT NULL,
    `status` ENUM('ACCEPTED', 'OVERDUE', 'PAYED') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `buy_credit_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `balance` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bank_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `in` DOUBLE NOT NULL,
    `out` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bank_id` INTEGER NOT NULL,

    INDEX `bank_transaction_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buy_credit_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Bank_id` INTEGER NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `amount_payed` DOUBLE NOT NULL,
    `outstanding_balance` DOUBLE NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `payment_method` ENUM('CASH', 'BANK', 'CREDIT') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `buy_credit_transaction_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `balance` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `in` DOUBLE NOT NULL,
    `out` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `manager_id` INTEGER NOT NULL,
    `casher_id` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cash_transaction_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_id` INTEGER NOT NULL,
    `customer_id` INTEGER NULL,
    `walker_id` VARCHAR(191) NULL,
    `manager_id` INTEGER NULL,
    `casher_id` INTEGER NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `price_per_quantity` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `payment_method` ENUM('CASH', 'BANK', 'CREDIT') NOT NULL,
    `customer_type` ENUM('WALKER', 'REGULAR') NOT NULL,
    `status` ENUM('DONE', 'CANCEL') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bank_id` INTEGER NULL,
    `sales_creditId` INTEGER NULL,

    INDEX `sale_transaction_transaction_id_price_per_quantity_quantity__idx`(`transaction_id`, `price_per_quantity`, `quantity`, `payment_method`, `customer_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_credit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `total_money` DOUBLE NOT NULL,
    `return_date` DATETIME(3) NOT NULL,
    `issued_date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACCEPTED', 'OVERDUE', 'PAYED') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sales_credit_transaction_id_customer_id_total_money_return_d_idx`(`transaction_id`, `customer_id`, `total_money`, `return_date`, `issued_date`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_credit_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NOT NULL,
    `amount_payed` DOUBLE NOT NULL,
    `payment_method` ENUM('CASH', 'BANK') NOT NULL,
    `bank_id` INTEGER NULL,
    `cash_id` INTEGER NULL,
    `outstanding_balance` DOUBLE NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sales_credit_transaction_transaction_id_amount_payed_payment_idx`(`transaction_id`, `amount_payed`, `payment_method`, `outstanding_balance`, `image`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_type` ADD CONSTRAINT `product_type_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_stock` ADD CONSTRAINT `product_stock_product_type_id_fkey` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buy_transaction` ADD CONSTRAINT `buy_transaction_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `product_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buy_transaction` ADD CONSTRAINT `buy_transaction_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_balance` ADD CONSTRAINT `bank_balance_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_transaction` ADD CONSTRAINT `bank_transaction_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buy_credit_transaction` ADD CONSTRAINT `buy_credit_transaction_Bank_id_fkey` FOREIGN KEY (`Bank_id`) REFERENCES `bank_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `product_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_transaction` ADD CONSTRAINT `sale_transaction_sales_creditId_fkey` FOREIGN KEY (`sales_creditId`) REFERENCES `sales_credit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_credit` ADD CONSTRAINT `sales_credit_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_credit_transaction` ADD CONSTRAINT `sales_credit_transaction_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales_credit_transaction` ADD CONSTRAINT `sales_credit_transaction_cash_id_fkey` FOREIGN KEY (`cash_id`) REFERENCES `cash_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
