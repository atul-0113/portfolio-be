require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const buildBackfillResumeJson = (resume) => ({
  metadata: {
    title: resume.title,
    slug: resume.slug,
    domain: resume.domain,
    status: resume.status,
    visibility: resume.visibility,
    createdFrom: 'resume-version-backfill'
  },
  basics: {},
  sections: [],
  themeSettings: resume.themeSettings || {}
});

const backfillResumeVersions = async () => {
  const resumes = await prisma.resume.findMany({
    where: {
      versions: {
        none: {}
      }
    }
  });

  for (const resume of resumes) {
    const version = await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: 1,
        resumeJson: buildBackfillResumeJson(resume),
        changeSummary: 'Backfilled initial resume version',
        createdBy: resume.userId
      }
    });

    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        currentVersionId: version.id
      }
    });

    console.log(`Backfilled resume ${resume.id} with version ${version.id}`);
  }

  console.log(`Backfilled ${resumes.length} resume(s).`);
};

backfillResumeVersions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
