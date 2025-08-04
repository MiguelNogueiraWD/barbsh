/*
  Warnings:

  - Added the required column `url` to the `GalleryImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "url" TEXT NOT NULL;
