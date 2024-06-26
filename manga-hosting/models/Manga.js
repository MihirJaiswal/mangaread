const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isSpoiler: {
    type: Boolean,
    default: false,
  }
});

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  replies: [ReplySchema],
  isSpoiler: {
    type: Boolean,
    default: false,
  }
});

const ChapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  subTitle: {
    type: String,
  },
  description: {
    type: String,
  },
  pdf: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String, // Assuming the cover image is stored as a URL
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [CommentSchema],
});

const MangaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true, // Added unique constraint
  },
  description: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pdf: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String, // Assuming the cover image is stored as a URL
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  nsfw: {
    type: Boolean,
    default: false,
  },
  chapters: [ChapterSchema],
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
  },
  comments: [CommentSchema],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field on save
MangaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Manga = mongoose.model('Manga', MangaSchema);

module.exports = Manga;
