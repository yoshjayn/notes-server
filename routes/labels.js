const express = require('express');
const {
  getLabels,
  getLabel,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToNotes,
  removeLabelFromNotes
} = require('../controllers/labels');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { labelValidation } = require('../validators/validationRules');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getLabels)
  .post(labelValidation.createLabel, validate, createLabel);

router.route('/:id')
  .get(labelValidation.idParam, validate, getLabel)
  .put(labelValidation.updateLabel, validate, updateLabel)
  .delete(labelValidation.idParam, validate, deleteLabel);

router.route('/:id/notes')
  .post(labelValidation.manageLabelNotes, validate, addLabelToNotes)
  .delete(labelValidation.manageLabelNotes, validate, removeLabelFromNotes);

module.exports = router;