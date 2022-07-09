-- CreateTable
CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `showName` BOOLEAN NOT NULL DEFAULT true,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `maxLoad` DOUBLE NOT NULL DEFAULT 1,
    `spellSlots` DOUBLE NOT NULL DEFAULT 1,
    `role` ENUM('PLAYER', 'NPC', 'ADMIN') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` CHAR(6) NOT NULL DEFAULT '0d6efd',
    `rollable` BOOLEAN NOT NULL,
    `portrait` ENUM('PRIMARY', 'SECONDARY') NULL,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttributeStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `attribute_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Characteristic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `specialization_id` INTEGER NULL,
    `startValue` INTEGER NOT NULL DEFAULT 0,
    `mandatory` BOOLEAN NOT NULL DEFAULT false,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `damage` VARCHAR(191) NOT NULL,
    `range` VARCHAR(191) NOT NULL,
    `attacks` VARCHAR(191) NOT NULL,
    `ammo` INTEGER NULL,
    `visible` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `visibleToAdmin` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExtraInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spell` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `cost` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `damage` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `castingTime` VARCHAR(191) NOT NULL,
    `range` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `slots` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerInfo` (
    `player_id` INTEGER NOT NULL,
    `info_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`player_id`, `info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerAttribute` (
    `player_id` INTEGER NOT NULL,
    `attribute_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `maxValue` INTEGER NOT NULL,
    `show` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`player_id`, `attribute_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerAttributeStatus` (
    `player_id` INTEGER NOT NULL,
    `attribute_status_id` INTEGER NOT NULL,
    `value` BOOLEAN NOT NULL,

    PRIMARY KEY (`player_id`, `attribute_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerSpec` (
    `player_id` INTEGER NOT NULL,
    `spec_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`player_id`, `spec_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerCharacteristic` (
    `player_id` INTEGER NOT NULL,
    `characteristic_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `modifier` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`player_id`, `characteristic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerSkill` (
    `player_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `modifier` INTEGER NOT NULL DEFAULT 0,
    `checked` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`player_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerEquipment` (
    `player_id` INTEGER NOT NULL,
    `equipment_id` INTEGER NOT NULL,
    `currentAmmo` INTEGER NOT NULL,

    PRIMARY KEY (`player_id`, `equipment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerItem` (
    `player_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `currentDescription` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`player_id`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerCurrency` (
    `player_id` INTEGER NOT NULL,
    `currency_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`player_id`, `currency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerExtraInfo` (
    `player_id` INTEGER NOT NULL,
    `extra_info_id` INTEGER NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`player_id`, `extra_info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerSpell` (
    `player_id` INTEGER NOT NULL,
    `spell_id` INTEGER NOT NULL,

    PRIMARY KEY (`player_id`, `spell_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerNote` (
    `player_id` INTEGER NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`player_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerAvatar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `attribute_status_id` INTEGER NULL,
    `link` TEXT NULL,

    UNIQUE INDEX `PlayerAvatar_player_id_attribute_status_id_key`(`player_id`, `attribute_status_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender_id` INTEGER NOT NULL,
    `sender_object_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `receiver_object_id` INTEGER NULL,

    UNIQUE INDEX `Trade_sender_id_key`(`sender_id`),
    UNIQUE INDEX `Trade_receiver_id_key`(`receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` LONGTEXT NOT NULL,

    UNIQUE INDEX `Config_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AttributeStatus` ADD CONSTRAINT `AttributeStatus_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `Attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_specialization_id_fkey` FOREIGN KEY (`specialization_id`) REFERENCES `Specialization`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `PlayerInfo` ADD CONSTRAINT `PlayerInfo_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerInfo` ADD CONSTRAINT `PlayerInfo_info_id_fkey` FOREIGN KEY (`info_id`) REFERENCES `Info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAttribute` ADD CONSTRAINT `PlayerAttribute_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAttribute` ADD CONSTRAINT `PlayerAttribute_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAttributeStatus` ADD CONSTRAINT `PlayerAttributeStatus_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAttributeStatus` ADD CONSTRAINT `PlayerAttributeStatus_attribute_status_id_fkey` FOREIGN KEY (`attribute_status_id`) REFERENCES `AttributeStatus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSpec` ADD CONSTRAINT `PlayerSpec_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSpec` ADD CONSTRAINT `PlayerSpec_spec_id_fkey` FOREIGN KEY (`spec_id`) REFERENCES `Spec`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerCharacteristic` ADD CONSTRAINT `PlayerCharacteristic_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerCharacteristic` ADD CONSTRAINT `PlayerCharacteristic_characteristic_id_fkey` FOREIGN KEY (`characteristic_id`) REFERENCES `Characteristic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSkill` ADD CONSTRAINT `PlayerSkill_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSkill` ADD CONSTRAINT `PlayerSkill_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerEquipment` ADD CONSTRAINT `PlayerEquipment_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerEquipment` ADD CONSTRAINT `PlayerEquipment_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerItem` ADD CONSTRAINT `PlayerItem_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerItem` ADD CONSTRAINT `PlayerItem_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerCurrency` ADD CONSTRAINT `PlayerCurrency_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerCurrency` ADD CONSTRAINT `PlayerCurrency_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `Currency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerExtraInfo` ADD CONSTRAINT `PlayerExtraInfo_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerExtraInfo` ADD CONSTRAINT `PlayerExtraInfo_extra_info_id_fkey` FOREIGN KEY (`extra_info_id`) REFERENCES `ExtraInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSpell` ADD CONSTRAINT `PlayerSpell_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSpell` ADD CONSTRAINT `PlayerSpell_spell_id_fkey` FOREIGN KEY (`spell_id`) REFERENCES `Spell`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerNote` ADD CONSTRAINT `PlayerNote_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAvatar` ADD CONSTRAINT `PlayerAvatar_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerAvatar` ADD CONSTRAINT `PlayerAvatar_attribute_status_id_fkey` FOREIGN KEY (`attribute_status_id`) REFERENCES `AttributeStatus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
