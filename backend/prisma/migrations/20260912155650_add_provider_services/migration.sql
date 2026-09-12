-- AlterTable
ALTER TABLE `provider_profiles` ADD COLUMN `hourlyRate` DECIMAL(10, 2) NULL,
    ADD COLUMN `title` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `provider_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerProfileId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `provider_services_providerProfileId_serviceId_key`(`providerProfileId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `provider_services` ADD CONSTRAINT `provider_services_providerProfileId_fkey` FOREIGN KEY (`providerProfileId`) REFERENCES `provider_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_services` ADD CONSTRAINT `provider_services_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
