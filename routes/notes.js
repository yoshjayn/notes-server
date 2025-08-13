const express = require('express');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  reorderNotes,
  togglePin,
  toggleArchive
} = require('../controllers/notes');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { noteValidation } = require('../validators/validationRules');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(noteValidation.getNotes, validate, getNotes)
  .post(noteValidation.createNote, validate, createNote);

router.route('/reorder')
  .put(noteValidation.reorderNotes, validate, reorderNotes);

router.route('/:id')
  .get(noteValidation.idParam, validate, getNote)
  .put(noteValidation.updateNote, validate, updateNote)
  .delete(noteValidation.idParam, validate, deleteNote);

router.route('/:id/pin')
  .put(noteValidation.idParam, validate, togglePin);

router.route('/:id/archive')
  .put(noteValidation.idParam, validate, toggleArchive);

module.exports = router;