CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS "Template" DROP CONSTRAINT IF EXISTS "Template_categoryType_fkey";
ALTER TABLE IF EXISTS "Template" DROP CONSTRAINT IF EXISTS "Template_createdById_fkey";
ALTER TABLE IF EXISTS "Category" DROP CONSTRAINT IF EXISTS "Category_createdById_fkey";

DO $$
BEGIN
  IF to_regclass('public.users') IS NULL AND to_regclass('public."User"') IS NOT NULL THEN
    ALTER TABLE "User" RENAME TO "users";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
  "mobileNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'id'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
  END IF;
END $$;

ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT true;
ALTER TABLE "users" ALTER COLUMN "isSubscribed" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "Category" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "categoryName" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "categoryImagePath" TEXT,
  "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" UUID NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Category'
      AND column_name = 'id'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "Category" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Category'
      AND column_name = 'createdById'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "Category" ALTER COLUMN "createdById" TYPE UUID USING "createdById"::uuid;
  END IF;
END $$;

ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Category" ALTER COLUMN "isActive" SET DEFAULT true;
ALTER TABLE "Category" ALTER COLUMN "createdOn" SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "Template" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "templateName" TEXT NOT NULL,
  "categoryType" UUID NOT NULL,
  "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" UUID NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "code" TEXT NOT NULL,
  CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Template'
      AND column_name = 'id'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "Template" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Template'
      AND column_name = 'categoryType'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "Template" ALTER COLUMN "categoryType" TYPE UUID USING "categoryType"::uuid;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Template'
      AND column_name = 'createdById'
      AND udt_name <> 'uuid'
  ) THEN
    ALTER TABLE "Template" ALTER COLUMN "createdById" TYPE UUID USING "createdById"::uuid;
  END IF;
END $$;

ALTER TABLE "Template" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Template" ALTER COLUMN "isActive" SET DEFAULT true;
ALTER TABLE "Template" ALTER COLUMN "createdOn" SET DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "resume_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255),
  "thumbnail_url" TEXT,
  "category" VARCHAR(100),
  "is_premium" BOOLEAN NOT NULL DEFAULT false,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "config" JSONB NOT NULL DEFAULT '{}',
  "created_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resume_templates_slug_key" ON "resume_templates"("slug");

CREATE TABLE IF NOT EXISTS "resumes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255),
  "domain" VARCHAR(100),
  "template_id" UUID,
  "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
  "visibility" VARCHAR(50) NOT NULL DEFAULT 'private',
  "current_version_id" UUID,
  "theme_settings" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resumes_slug_key" ON "resumes"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "resumes_current_version_id_key" ON "resumes"("current_version_id");

CREATE TABLE IF NOT EXISTS "resume_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "resume_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "resume_json" JSONB NOT NULL,
  "change_summary" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resume_versions_resume_id_version_number_key"
  ON "resume_versions"("resume_id", "version_number");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_createdById_fkey') THEN
    ALTER TABLE "Category"
      ADD CONSTRAINT "Category_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Template_categoryType_fkey') THEN
    ALTER TABLE "Template"
      ADD CONSTRAINT "Template_categoryType_fkey"
      FOREIGN KEY ("categoryType") REFERENCES "Category"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Template_createdById_fkey') THEN
    ALTER TABLE "Template"
      ADD CONSTRAINT "Template_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resume_templates_created_by_id_fkey') THEN
    ALTER TABLE "resume_templates"
      ADD CONSTRAINT "resume_templates_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_user_id_fkey') THEN
    ALTER TABLE "resumes"
      ADD CONSTRAINT "resumes_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_template_id_fkey') THEN
    ALTER TABLE "resumes"
      ADD CONSTRAINT "resumes_template_id_fkey"
      FOREIGN KEY ("template_id") REFERENCES "resume_templates"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resume_versions_resume_id_fkey') THEN
    ALTER TABLE "resume_versions"
      ADD CONSTRAINT "resume_versions_resume_id_fkey"
      FOREIGN KEY ("resume_id") REFERENCES "resumes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resume_versions_created_by_fkey') THEN
    ALTER TABLE "resume_versions"
      ADD CONSTRAINT "resume_versions_created_by_fkey"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_current_version_id_fkey') THEN
    ALTER TABLE "resumes"
      ADD CONSTRAINT "resumes_current_version_id_fkey"
      FOREIGN KEY ("current_version_id") REFERENCES "resume_versions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
