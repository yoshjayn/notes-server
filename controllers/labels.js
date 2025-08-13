const Label = require('../models/Label');
const Note = require('../models/Note');

// @desc    Get all labels for a user
// @route   GET /api/labels
// @access  Private
exports.getLabels = async (req, res, next) => {
  try {
    const labels = await Label.find({ user: req.user.id })
      .sort('name');

    // Get note count for each label
    const labelsWithCount = await Promise.all(
      labels.map(async (label) => {
        const noteCount = await Note.countDocuments({
          user: req.user.id,
          labels: label._id
        });
        
        return {
          ...label.toObject(),
          noteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: labels.length,
      data: labelsWithCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single label
// @route   GET /api/labels/:id
// @access  Private
exports.getLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        error: 'Label not found'
      });
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this label'
      });
    }

    // Get notes with this label
    const notes = await Note.find({
      user: req.user.id,
      labels: label._id
    }).populate('labels', 'name color');

    res.status(200).json({
      success: true,
      data: {
        label,
        notes,
        noteCount: notes.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new label
// @route   POST /api/labels
// @access  Private
exports.createLabel = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if label with same name exists for user
    const existingLabel = await Label.findOne({
      name: req.body.name,
      user: req.user.id
    });

    if (existingLabel) {
      return res.status(400).json({
        success: false,
        error: 'Label with this name already exists'
      });
    }

    const label = await Label.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        ...label.toObject(),
        noteCount: 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update label
// @route   PUT /api/labels/:id
// @access  Private
exports.updateLabel = async (req, res, next) => {
  try {
    let label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        error: 'Label not found'
      });
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this label'
      });
    }

    // Check if new name conflicts with existing label
    if (req.body.name && req.body.name !== label.name) {
      const existingLabel = await Label.findOne({
        name: req.body.name,
        user: req.user.id,
        _id: { $ne: req.params.id }
      });

      if (existingLabel) {
        return res.status(400).json({
          success: false,
          error: 'Label with this name already exists'
        });
      }
    }

    label = await Label.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const noteCount = await Note.countDocuments({
      user: req.user.id,
      labels: label._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...label.toObject(),
        noteCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete label
// @route   DELETE /api/labels/:id
// @access  Private
exports.deleteLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        error: 'Label not found'
      });
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this label'
      });
    }

    // Remove label from all notes
    await Note.updateMany(
      { user: req.user.id, labels: label._id },
      { $pull: { labels: label._id } }
    );

    await label.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add label to multiple notes
// @route   POST /api/labels/:id/notes
// @access  Private
exports.addLabelToNotes = async (req, res, next) => {
  try {
    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of note IDs'
      });
    }

    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        error: 'Label not found'
      });
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to use this label'
      });
    }

    // Update notes - only those belonging to the user
    const result = await Note.updateMany(
      {
        _id: { $in: noteIds },
        user: req.user.id,
        labels: { $ne: label._id } // Don't add if already exists
      },
      { $push: { labels: label._id } }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove label from multiple notes
// @route   DELETE /api/labels/:id/notes
// @access  Private
exports.removeLabelFromNotes = async (req, res, next) => {
  try {
    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of note IDs'
      });
    }

    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({
        success: false,
        error: 'Label not found'
      });
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to use this label'
      });
    }

    // Update notes - only those belonging to the user
    const result = await Note.updateMany(
      {
        _id: { $in: noteIds },
        user: req.user.id
      },
      { $pull: { labels: label._id } }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    next(err);
  }
};