const { body, param, query } = require('express-validator');

// Auth validation rules
exports.authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  updateDetails: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  updatePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  forgotPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  resetPassword: [
    param('resettoken')
      .notEmpty().withMessage('Reset token is required'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ]
};

// Note validation rules
exports.noteValidation = {
  createNote: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please provide a valid hex color'),
    body('isPinned')
      .optional()
      .isBoolean().withMessage('isPinned must be a boolean'),
    body('isArchived')
      .optional()
      .isBoolean().withMessage('isArchived must be a boolean'),
    body('labels')
      .optional()
      .isArray().withMessage('Labels must be an array')
      .custom((value) => value.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
      .withMessage('Invalid label ID format')
  ],
  updateNote: [
    param('id')
      .isMongoId().withMessage('Invalid note ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please provide a valid hex color'),
    body('isPinned')
      .optional()
      .isBoolean().withMessage('isPinned must be a boolean'),
    body('isArchived')
      .optional()
      .isBoolean().withMessage('isArchived must be a boolean'),
    body('labels')
      .optional()
      .isArray().withMessage('Labels must be an array')
      .custom((value) => value.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
      .withMessage('Invalid label ID format')
  ],
  reorderNotes: [
    body('noteId')
      .notEmpty().withMessage('Note ID is required')
      .isMongoId().withMessage('Invalid note ID'),
    body('newOrder')
      .notEmpty().withMessage('New order is required')
      .isInt({ min: 0 }).withMessage('Order must be a positive integer')
  ],
  getNotes: [
    query('search')
      .optional()
      .trim(),
    query('labels')
      .optional()
      .trim(),
    query('isPinned')
      .optional()
      .isIn(['true', 'false']).withMessage('isPinned must be true or false'),
    query('isArchived')
      .optional()
      .isIn(['true', 'false']).withMessage('isArchived must be true or false'),
    query('sortBy')
      .optional()
      .trim()
  ],
  idParam: [
    param('id')
      .isMongoId().withMessage('Invalid note ID')
  ]
};

// Label validation rules
exports.labelValidation = {
  createLabel: [
    body('name')
      .trim()
      .notEmpty().withMessage('Label name is required')
      .isLength({ max: 30 }).withMessage('Label name cannot exceed 30 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please provide a valid hex color')
  ],
  updateLabel: [
    param('id')
      .isMongoId().withMessage('Invalid label ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 30 }).withMessage('Label name cannot exceed 30 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please provide a valid hex color')
  ],
  manageLabelNotes: [
    param('id')
      .isMongoId().withMessage('Invalid label ID'),
    body('noteIds')
      .notEmpty().withMessage('Note IDs are required')
      .isArray().withMessage('Note IDs must be an array')
      .custom((value) => value.length > 0).withMessage('Note IDs array cannot be empty')
      .custom((value) => value.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
      .withMessage('Invalid note ID format')
  ],
  idParam: [
    param('id')
      .isMongoId().withMessage('Invalid label ID')
  ]
};
      