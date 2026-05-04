-- Custom migration: add class per subject assignment; backfill from teacher homeroom.

ALTER TABLE "teacher_subjects" DROP CONSTRAINT IF EXISTS "teacher_subjects_teacher_id_subject_id_key";

ALTER TABLE "teacher_subjects" ADD COLUMN IF NOT EXISTS "class_level" TEXT;

UPDATE "teacher_subjects" AS ts
SET "class_level" = COALESCE(NULLIF(TRIM(t."homeroom_class"), ''), 'JSS 1A')
FROM "teachers" AS t
WHERE ts."teacher_id" = t."id"
  AND (ts."class_level" IS NULL OR TRIM(ts."class_level") = '');

ALTER TABLE "teacher_subjects" ALTER COLUMN "class_level" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "teacher_subjects_teacher_id_subject_id_class_level_key"
  ON "teacher_subjects"("teacher_id", "subject_id", "class_level");

CREATE INDEX IF NOT EXISTS "teacher_subjects_teacher_id_class_level_idx"
  ON "teacher_subjects"("teacher_id", "class_level");
