const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const slugify = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const toBoolean = (value, defaultValue = false) => {
  if (typeof value === 'undefined') {
    return defaultValue;
  }

  return value === true || value === 'true';
};

const normalizeOptionalString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeNullableString = (value) => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (value, fieldName) => {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ApiError(400, `${fieldName} must be a valid UUID`);
  }
};

const buildInitialResumeJson = ({ title, domain, themeSettings }) => ({
  metadata: {
    title,
    domain: domain || null,
    createdFrom: 'resume-builder'
  },
  basics: {},
  sections: [],
  themeSettings
});

const canAccessResume = (resume, user) => {
  return user.role === 'ADMIN' || resume.userId === user.id;
};

const serializeResume = (resume) => {
  const latestVersion = Array.isArray(resume.versions) ? resume.versions[0] : null;
  const currentVersion = resume.currentVersion || latestVersion || null;
  const versionCount = resume._count?.versions ?? resume.versionCount ?? 0;
  const { versions, _count, ...resumeData } = resume;

  return {
    ...resumeData,
    currentVersionId: currentVersion?.id || resume.currentVersionId,
    currentVersion,
    metadata: {
      title: resume.title,
      slug: resume.slug,
      domain: resume.domain,
      status: resume.status,
      visibility: resume.visibility,
      templateId: resume.templateId,
      currentVersionId: currentVersion?.id || resume.currentVersionId,
      currentVersionNumber: currentVersion?.versionNumber || null,
      versionCount,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }
  };
};

const buildUniqueSlug = async (value, model, excludeId) => {
  const baseSlug = slugify(value);

  if (!baseSlug) {
    return null;
  }

  let slug = baseSlug;
  let index = 1;

  while (slug) {
    const existing = await prisma[model].findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return null;
};

const getResumeForUser = async (resumeId, user) => {
  assertUuid(resumeId, 'resumeId');

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      template: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      currentVersion: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1
      },
      _count: {
        select: { versions: true }
      }
    }
  });

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  if (!canAccessResume(resume, user)) {
    throw new ApiError(403, 'Not authorized to access this resume');
  }

  return serializeResume(resume);
};

const createResumeVersion = async ({ resumeId, resumeJson, changeSummary, createdBy }) => {
  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId },
    orderBy: { versionNumber: 'desc' }
  });

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId,
      versionNumber: latestVersion ? latestVersion.versionNumber + 1 : 1,
      resumeJson,
      changeSummary,
      createdBy
    }
  });

  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      currentVersionId: version.id
    }
  });

  return version;
};

const resumeService = {
  async listResumes(user) {
    const resumes = await prisma.resume.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        },
        _count: {
          select: { versions: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return resumes.map(serializeResume);
  },

  async createResume(user, payload) {
    const title = normalizeOptionalString(payload.title);
    const slug = normalizeOptionalString(payload.slug);
    const domain = normalizeNullableString(payload.domain);
    const templateId = normalizeNullableString(payload.templateId);
    const status = normalizeOptionalString(payload.status) || 'draft';
    const visibility = normalizeOptionalString(payload.visibility) || 'private';
    const themeSettings = payload.themeSettings || {};
    const resumeJson = payload.resumeJson || buildInitialResumeJson({ title, domain, themeSettings });
    const changeSummary = normalizeOptionalString(payload.changeSummary);

    if (!title) {
      throw new ApiError(400, 'title is required');
    }

    if (templateId) {
      assertUuid(templateId, 'templateId');

      const template = await prisma.resumeTemplate.findUnique({ where: { id: templateId } });
      if (!template || !template.isActive) {
        throw new ApiError(400, 'Selected resume template is not available');
      }
    }

    const finalSlug = await buildUniqueSlug(slug || title, 'resume');

    return prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          userId: user.id,
          title,
          slug: finalSlug,
          domain,
          ...(templateId ? { templateId } : {}),
          status,
          visibility,
          themeSettings
        }
      });

      const version = await tx.resumeVersion.create({
        data: {
          resumeId: resume.id,
          versionNumber: 1,
          resumeJson,
          changeSummary,
          createdBy: user.id
        }
      });

      const createdResume = await tx.resume.update({
        where: { id: resume.id },
        data: { currentVersionId: version.id },
        include: {
          template: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          currentVersion: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1
          },
          _count: {
            select: { versions: true }
          }
        }
      });

      return serializeResume(createdResume);
    });
  },

  async getResume(resumeId, user) {
    return getResumeForUser(resumeId, user);
  },

  async updateResume(resumeId, user, payload) {
    const resume = await getResumeForUser(resumeId, user);
    const title = normalizeOptionalString(payload.title);
    const slug = normalizeOptionalString(payload.slug);
    const domain = normalizeNullableString(payload.domain);
    const templateId = normalizeNullableString(payload.templateId);
    const status = normalizeOptionalString(payload.status);
    const visibility = normalizeOptionalString(payload.visibility);
    const themeSettings = payload.themeSettings;

    if (templateId !== undefined && templateId !== null) {
      assertUuid(templateId, 'templateId');

      const template = await prisma.resumeTemplate.findUnique({ where: { id: templateId } });
      if (!template || !template.isActive) {
        throw new ApiError(400, 'Selected resume template is not available');
      }
    }

    const nextSlug = slug
      ? await buildUniqueSlug(slug, 'resume', resumeId)
      : title && title !== resume.title
        ? await buildUniqueSlug(title, 'resume', resumeId)
        : undefined;

    return prisma.resume.update({
      where: { id: resumeId },
      data: {
        ...(title ? { title } : {}),
        ...(typeof nextSlug !== 'undefined' ? { slug: nextSlug } : {}),
        ...(typeof domain !== 'undefined' ? { domain } : {}),
        ...(typeof templateId !== 'undefined' ? { templateId } : {}),
        ...(status ? { status } : {}),
        ...(visibility ? { visibility } : {}),
        ...(typeof themeSettings !== 'undefined' ? { themeSettings } : {})
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        },
        _count: {
          select: { versions: true }
        }
      }
    }).then(serializeResume);
  },

  async deleteResume(resumeId, user) {
    await getResumeForUser(resumeId, user);
    await prisma.resume.delete({ where: { id: resumeId } });
  },

  async listVersions(resumeId, user) {
    await getResumeForUser(resumeId, user);

    return prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { versionNumber: 'desc' }
    });
  },

  async createVersion(resumeId, user, payload) {
    await getResumeForUser(resumeId, user);

    if (!payload.resumeJson) {
      throw new ApiError(400, 'resumeJson is required');
    }

    return createResumeVersion({
      resumeId,
      resumeJson: payload.resumeJson,
      changeSummary: normalizeOptionalString(payload.changeSummary),
      createdBy: user.id
    });
  },

  async listTemplates(user) {
    return prisma.resumeTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { isSystem: true },
          { createdById: user.id }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createTemplate(user, payload) {
    const name = normalizeOptionalString(payload.name);
    const slug = normalizeOptionalString(payload.slug);
    const thumbnailUrl = normalizeNullableString(payload.thumbnailUrl);
    const category = normalizeNullableString(payload.category);
    const { isPremium, isSystem, config = {} } = payload;

    if (!name) {
      throw new ApiError(400, 'name is required');
    }

    const finalSlug = await buildUniqueSlug(slug || name, 'resumeTemplate');

    return prisma.resumeTemplate.create({
      data: {
        name,
        slug: finalSlug,
        thumbnailUrl,
        category,
        isPremium: user.role === 'ADMIN' ? toBoolean(isPremium) : false,
        isSystem: user.role === 'ADMIN' ? toBoolean(isSystem) : false,
        config,
        createdById: user.id
      }
    });
  },

  async getTemplate(templateId, user) {
    assertUuid(templateId, 'templateId');

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template || !template.isActive) {
      throw new ApiError(404, 'Resume template not found');
    }

    if (!template.isSystem && template.createdById !== user.id && user.role !== 'ADMIN') {
      throw new ApiError(403, 'Not authorized to access this resume template');
    }

    return template;
  }
};

module.exports = { resumeService };
