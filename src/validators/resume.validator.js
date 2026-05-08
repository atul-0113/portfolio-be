const { body, param } = require('express-validator');

const uuidValidation = (fieldName = 'id') => param(fieldName)
  .isUUID()
  .withMessage(`${fieldName} must be a valid UUID`);

const optionalString = (fieldName) => body(fieldName)
  .optional({ nullable: true, checkFalsy: true })
  .isString()
  .withMessage(`${fieldName} must be a string`);

const optionalObject = (fieldName) => body(fieldName)
  .optional({ nullable: true })
  .isObject()
  .withMessage(`${fieldName} must be an object`);

const optionalArray = (fieldName) => body(fieldName)
  .optional({ nullable: true })
  .isArray()
  .withMessage(`${fieldName} must be an array`);

const titleValidation = (isRequired) => {
  const validation = body('title');

  if (!isRequired) {
    return validation
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage('title must be a string');
  }

  return validation
    .exists({ checkFalsy: true })
    .withMessage('title is required')
    .bail()
    .isString()
    .withMessage('title must be a string');
};

const resumeDocumentValidation = (isCreate = true) => [
  titleValidation(isCreate),
  optionalString('slug'),
  optionalString('domain'),
  body('templateId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('templateId must be a valid UUID'),
  optionalString('themeId'),
  optionalString('language'),
  body('status')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['draft', 'published', 'archived'])
    .withMessage('status must be one of: draft, published, archived'),
  body('visibility')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['private', 'public', 'unlisted'])
    .withMessage('visibility must be one of: private, public, unlisted'),
  body('version')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('version must be a positive integer'),
  body('isPrimary')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
  optionalArray('tags'),
  optionalObject('metadata'),
  optionalObject('metaData'),
  optionalObject('personalInformation'),
  optionalArray('sections'),
  optionalObject('themeSettings'),
  optionalObject('exportConfigurations'),
  optionalObject('resumeJson'),
  optionalString('changeSummary'),
  body('sections.*.id')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('section id must be a string'),
  body('sections.*.type')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('section type must be a string'),
  body('sections.*.title')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('section title must be a string'),
  body('sections.*.position')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('section position must be a non-negative integer'),
  body('sections.*.isVisible')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('section isVisible must be a boolean'),
  body('sections.*.config')
    .optional({ nullable: true })
    .isObject()
    .withMessage('section config must be an object'),
  body('sections.*.items')
    .optional({ nullable: true })
    .isArray()
    .withMessage('section items must be an array')
];

const resumeUpdateValidation = [
  uuidValidation(),
  ...resumeDocumentValidation(false)
];

const resumeTemplateValidation = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('name is required')
    .bail()
    .isString()
    .withMessage('name must be a string'),
  optionalString('slug'),
  optionalString('thumbnailUrl'),
  optionalString('category'),
  body('isPremium')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('isPremium must be a boolean'),
  body('isSystem')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('isSystem must be a boolean'),
  optionalObject('config')
];

module.exports = {
  uuidValidation,
  resumeDocumentValidation: resumeDocumentValidation(true),
  resumeUpdateValidation,
  resumeTemplateValidation
};
