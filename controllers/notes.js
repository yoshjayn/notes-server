const Note = require('../models/Note');
const Label = require('../models/Label');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const {
      search,
      labels,
      isPinned,
      isArchived,
      sortBy = '-isPinned,-createdAt'
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filter by archive status
    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    }

    // Filter by pin status
    if (isPinned !== undefined) {
      query.isPinned = isPinned === 'true';
    }

    // Filter by labels
    if (labels) {
      const labelIds = labels.split(',');
      query.labels = { $in: labelIds };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query)
      .populate('labels', 'name color')
      .sort(sortBy);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('labels', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Validate labels belong to user
    if (req.body.labels && req.body.labels.length > 0) {
      const userLabels = await Label.find({
        _id: { $in: req.body.labels },
        user: req.user.id
      });

      if (userLabels.length !== req.body.labels.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid labels'
        });
      }
    }

    // Get the highest order value for the user's notes
    const highestOrderNote = await Note.findOne({ user: req.user.id })
      .sort('-order')
      .limit(1);
    
    req.body.order = highestOrderNote ? highestOrderNote.order + 1 : 0;

    const note = await Note.create(req.body);

    // Populate labels for response
    await note.populate('labels', 'name color');

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    // Validate labels belong to user if updating labels
    if (req.body.labels && req.body.labels.length > 0) {
      const userLabels = await Label.find({
        _id: { $in: req.body.labels },
        user: req.user.id
      });

      if (userLabels.length !== req.body.labels.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid labels'
        });
      }
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('labels', 'name color');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder notes (for drag and drop)
// @route   PUT /api/notes/reorder
// @access  Private
exports.reorderNotes = async (req, res, next) => {
  try {
    const { noteId, newOrder } = req.body;

    // Verify note belongs to user
    const note = await Note.findOne({ _id: noteId, user: req.user.id });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const oldOrder = note.order;

    // Update orders for affected notes
    if (newOrder > oldOrder) {
      // Moving down: decrease order for notes in between
      await Note.updateMany(
        {
          user: req.user.id,
          order: { $gt: oldOrder, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      // Moving up: increase order for notes in between
      await Note.updateMany(
        {
          user: req.user.id,
          order: { $gte: newOrder, $lt: oldOrder }
        },
        { $inc: { order: 1 } }
      );
    }

    // Update the moved note's order
    note.order = newOrder;
    await note.save();

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle pin status
// @route   PUT /api/notes/:id/pin
// @access  Private
exports.togglePin = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    await note.populate('labels', 'name color');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle archive status
// @route   PUT /api/notes/:id/archive
// @access  Private
exports.toggleArchive = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    note.isArchived = !note.isArchived;
    // Unpin if archiving
    if (note.isArchived) {
      note.isPinned = false;
    }
    await note.save();

    await note.populate('labels', 'name color');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};