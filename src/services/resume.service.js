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
  title,
  domain: domain || null,
  status: 'draft',
  visibility: 'private',
  version: 1,
  isPrimary: false,
  tags: [],
  metadata: {
    title,
    domain: domain || null,
    status: 'draft',
    visibility: 'private',
    version: 1,
    isPrimary: false,
    tags: []
  },
  personalInformation: {},
  basics: {},
  sections: [],
  themeSettings,
  exportConfigurations: {}
});

const hasResumeDocumentPayload = (payload) => {
  return Boolean(
    payload.resumeJson ||
    payload.metadata ||
    payload.metaData ||
    payload.personalInformation ||
    payload.sections ||
    payload.exportConfigurations
  );
};

const canAccessResume = (resume, user) => {
  return user.role === 'ADMIN' || resume.userId === user.id;
};

const serializeResume = (resume) => {
  const latestVersion = Array.isArray(resume.versions) ? resume.versions[0] : null;
  const currentVersion = resume.currentVersion || latestVersion || null;
  const versionCount = resume._count?.versions ?? resume.versionCount ?? 0;

  return {
    id: resume.id,
    userId: resume.userId,
    user: resume.user,
    title: resume.title,
    slug: resume.slug,
    domain: resume.domain,
    templateId: resume.templateId,
    template: resume.template,
    status: resume.status,
    visibility: resume.visibility,
    currentVersionId: currentVersion?.id || resume.currentVersionId,
    currentVersion: currentVersion ? {
      id: currentVersion.id,
      versionNumber: currentVersion.versionNumber,
      changeSummary: currentVersion.changeSummary,
      createdBy: currentVersion.createdBy,
      createdAt: currentVersion.createdAt
    } : null,
    themeSettings: resume.themeSettings,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
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

const buildResumeDocument = (resume) => {
  const serializedResume = serializeResume(resume);
  const latestVersion = Array.isArray(resume.versions) ? resume.versions[0] : null;
  const fullCurrentVersion = resume.currentVersion || latestVersion || null;
  const resumeJson = fullCurrentVersion?.resumeJson || {};
  const jsonMetadata = resumeJson.metadata || {};

  return {
    ...resumeJson,
    id: serializedResume.id,
    userId: serializedResume.userId,
    user: serializedResume.user,
    title: serializedResume.title,
    slug: serializedResume.slug,
    domain: serializedResume.domain,
    templateId: serializedResume.templateId || resumeJson.templateId || '',
    template: serializedResume.template,
    status: serializedResume.status,
    visibility: serializedResume.visibility,
    version: serializedResume.metadata.currentVersionNumber || resumeJson.version || 1,
    themeSettings: serializedResume.themeSettings || resumeJson.themeSettings || {},
    metadata: {
      ...jsonMetadata,
      title: jsonMetadata.title ?? serializedResume.title,
      slug: jsonMetadata.slug ?? serializedResume.slug,
      domain: jsonMetadata.domain ?? serializedResume.domain,
      templateId: jsonMetadata.templateId ?? serializedResume.templateId ?? '',
      status: jsonMetadata.status ?? serializedResume.status,
      visibility: jsonMetadata.visibility ?? serializedResume.visibility,
      version: jsonMetadata.version ?? serializedResume.metadata.currentVersionNumber ?? 1,
      currentVersionId: serializedResume.metadata.currentVersionId,
      currentVersionNumber: serializedResume.metadata.currentVersionNumber,
      versionCount: serializedResume.metadata.versionCount,
      createdAt: serializedResume.createdAt,
      updatedAt: serializedResume.updatedAt
    },
    currentVersionId: serializedResume.currentVersionId,
    currentVersion: fullCurrentVersion,
    createdAt: serializedResume.createdAt,
    updatedAt: serializedResume.updatedAt
  };
};

const buildResumeJsonFromPayload = ({ payload, title, slug, domain, templateId, status, visibility, themeSettings, version }) => {
  const source = payload.resumeJson || payload;
  const incomingMetadata = source.metadata || source.metaData || {};
  const metadata = {
    ...incomingMetadata,
    title: incomingMetadata.title ?? title,
    slug: incomingMetadata.slug ?? slug,
    domain: incomingMetadata.domain ?? domain,
    templateId: incomingMetadata.templateId ?? templateId ?? '',
    themeId: incomingMetadata.themeId ?? normalizeNullableString(payload.themeId) ?? source.themeId ?? '',
    language: incomingMetadata.language ?? normalizeOptionalString(payload.language) ?? source.language ?? 'en',
    status: incomingMetadata.status ?? status,
    visibility: incomingMetadata.visibility ?? visibility,
    version,
    isPrimary: incomingMetadata.isPrimary ?? (typeof payload.isPrimary !== 'undefined' ? payload.isPrimary : source.isPrimary || false),
    tags: incomingMetadata.tags ?? (Array.isArray(payload.tags) ? payload.tags : source.tags || [])
  };

  return {
    ...source,
    title,
    slug,
    domain,
    templateId: templateId || '',
    themeId: metadata.themeId,
    language: metadata.language,
    status,
    visibility,
    version,
    isPrimary: metadata.isPrimary,
    tags: metadata.tags,
    metadata,
    themeSettings: themeSettings || source.themeSettings || {},
    personalInformation: source.personalInformation || {},
    sections: Array.isArray(source.sections) ? source.sections : [],
    exportConfigurations: source.exportConfigurations || {}
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

const getResumeDocumentForUser = async (resumeId, user) => {
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

  return buildResumeDocument(resume);
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
    const resumeJson = hasResumeDocumentPayload(payload)
      ? buildResumeJsonFromPayload({
        payload,
        title,
        slug: finalSlug,
        domain,
        templateId,
        status,
        visibility,
        themeSettings,
        version: 1
      })
      : buildInitialResumeJson({ title, domain, themeSettings });

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
    return getResumeDocumentForUser(resumeId, user);
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
    const latestVersionNumber = resume.metadata.currentVersionNumber || 0;

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

    const nextResumeData = {
      title: title || resume.title,
      slug: typeof nextSlug !== 'undefined' ? nextSlug : resume.slug,
      domain: typeof domain !== 'undefined' ? domain : resume.domain,
      templateId: typeof templateId !== 'undefined' ? templateId : resume.templateId,
      status: status || resume.status,
      visibility: visibility || resume.visibility,
      themeSettings: typeof themeSettings !== 'undefined' ? themeSettings : resume.themeSettings
    };

    const nextVersionNumber = latestVersionNumber + 1;
    const resumeJson = buildResumeJsonFromPayload({
      payload,
      title: nextResumeData.title,
      slug: nextResumeData.slug,
      domain: nextResumeData.domain,
      templateId: nextResumeData.templateId,
      status: nextResumeData.status,
      visibility: nextResumeData.visibility,
      themeSettings: nextResumeData.themeSettings,
      version: nextVersionNumber
    });

    return prisma.$transaction(async (tx) => {
      const updatedResume = await tx.resume.update({
        where: { id: resumeId },
        data: {
          ...(title ? { title } : {}),
          ...(typeof nextSlug !== 'undefined' ? { slug: nextSlug } : {}),
          ...(typeof domain !== 'undefined' ? { domain } : {}),
          ...(typeof templateId !== 'undefined' ? { templateId } : {}),
          ...(status ? { status } : {}),
          ...(visibility ? { visibility } : {}),
          ...(typeof themeSettings !== 'undefined' ? { themeSettings } : {})
        }
      });

      const version = await tx.resumeVersion.create({
        data: {
          resumeId,
          versionNumber: nextVersionNumber,
          resumeJson,
          changeSummary: normalizeOptionalString(payload.changeSummary) || 'Resume updated',
          createdBy: user.id
        }
      });

      const resumeWithVersion = await tx.resume.update({
        where: { id: updatedResume.id },
        data: {
          currentVersionId: version.id
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
      });

      return buildResumeDocument(resumeWithVersion);
    });
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
