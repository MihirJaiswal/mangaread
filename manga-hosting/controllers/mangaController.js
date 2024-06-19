const Manga = require('../models/Manga');
const fs = require('fs');
const axios = require('axios'); // Assuming you'll use axios for API requests
const { validationResult } = require('express-validator');

// Function to upload manga
exports.uploadManga = async (req, res) => {
  const { title, description, genre, chapterNumber, tags, status } = req.body;
  const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
  const coverImageFile = req.files['coverImage'] ? req.files['coverImage'][0] : null;

  if (!pdfFile) {
    console.error('No PDF file uploaded');
    return res.status(400).json({ msg: 'No PDF file uploaded' });
  }

  if (!coverImageFile) {
    console.error('No cover image uploaded');
    return res.status(400).json({ msg: 'No cover image uploaded' });
  }

  try {
    console.log('Skipping NSFW content check');

    const manga = new Manga({
      title,
      description,
      author: req.user.id,
      pdf: pdfFile.path,
      coverImage: coverImageFile.path,
      genre,
      chapterNumber,
      tags: tags ? tags.split(',') : [],
      status: status || 'ongoing',
      nsfw: false, // Temporarily setting this to false
    });

    await manga.save();
    console.log('Manga saved successfully:', manga);
    res.json(manga);
  } catch (err) {
    console.error('Error during upload process:', err);
    res.status(500).send('Server error');
  }
};

// Function to get all mangas
exports.getMangas = async (req, res) => {
  try {
    const mangas = await Manga.find()
      .populate('author', ['username'])
      .populate('comments.user', 'username profilePicture');
    res.json(mangas);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Function to get manga by title
exports.getMangaByTitle = async (req, res) => {
  const title = req.params.title;

  try {
    const manga = await Manga.findOne({ title })
      .populate('author', ['username'])
      .populate('comments.user', 'username profilePicture');
    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }
    res.json(manga);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Function to add a new chapter
exports.addChapter = async (req, res) => {
  const { title, chapterNumber, subTitle, description } = req.body;
  const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
  const coverImageFile = req.files['coverImage'] ? req.files['coverImage'][0] : null;

  if (!pdfFile) {
    console.error('No PDF file uploaded');
    return res.status(400).json({ msg: 'No PDF file uploaded' });
  }

  if (!coverImageFile) {
    console.error('No cover image uploaded');
    return res.status(400).json({ msg: 'No cover image uploaded' });
  }

  try {
    const manga = await Manga.findOne({ title });

    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Check if the logged-in user is the author of the manga
    if (manga.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    manga.chapters.push({
      chapterNumber,
      title,
      subTitle,
      description,
      pdf: pdfFile.path,
      coverImage: coverImageFile.path,
    });

    await manga.save();
    console.log('Chapter added successfully:', manga);
    res.json(manga);
  } catch (err) {
    console.error('Error adding chapter:', err);
    res.status(500).send('Server error');
  }
};

// Function to add comments
exports.addComment = async (req, res) => {
  const title = req.params.title;
  const { text } = req.body;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const manga = await Manga.findOne({ title });
    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    manga.comments.push(newComment);
    await manga.save();

    // Populate the newly added comment's user field
    const populatedManga = await Manga.findOne({ title }).populate('comments.user', 'username profilePicture');
    const addedComment = populatedManga.comments.find(comment => comment.text === newComment.text && comment.user.equals(req.user.id));

    console.log('Added Comment:', addedComment);
    res.status(201).json(addedComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Server error');
  }
};

// Function to delete a comment
exports.deleteComment = async (req, res) => {
  const title = req.params.title;
  const commentId = req.params.commentId;

  try {
    const manga = await Manga.findOne({ title });
    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Find the comment to delete
    const comment = manga.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if the comment belongs to the authenticated user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove the comment
    manga.comments.pull(commentId);
    await manga.save();

    res.json({ msg: 'Comment deleted' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to update manga details
exports.updateManga = async (req, res) => {
  const { title, description, genre, chapterNumber, tags, status } = req.body;
  const { id } = req.params; // Assuming id is passed as a parameter

  try {
    let manga = await Manga.findById(id);

    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Check if the logged-in user is the author of the manga
    if (manga.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    manga.title = title;
    manga.description = description;
    manga.genre = genre;
    manga.chapterNumber = chapterNumber;
    manga.tags = tags ? tags.split(',') : manga.tags;
    manga.status = status || manga.status;

    await manga.save();

    console.log('Manga updated successfully:', manga);
    res.json(manga);
  } catch (err) {
    console.error('Error updating manga:', err);
    res.status(500).send('Server error');
  }
};

// Function to delete manga
exports.deleteManga = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the manga document by ID
    const manga = await Manga.findById(id);

    // Check if manga exists
    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Check authorization: Ensure the logged-in user is the author of the manga
    if (manga.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    // Delete all chapters related to the manga (optional, depends on your design)
    // await Chapter.deleteMany({ manga: manga._id });

    // Remove the manga document
    await Manga.findByIdAndDelete(id);

    console.log('Manga deleted successfully');
    return res.json({ msg: 'Manga deleted successfully' });
  } catch (err) {
    console.error('Error deleting manga:', err);
    return res.status(500).send('Server error');
  }
};



// Function to update a chapter
exports.updateChapter = async (req, res) => {
  const { title, chapterNumber, subTitle, description } = req.body;
  const { mangaId, chapterId } = req.params;

  try {
    let manga = await Manga.findById(mangaId);

    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Check if the logged-in user is the author of the manga
    if (manga.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    let chapter = manga.chapters.id(chapterId);

    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }

    chapter.title = title;
    chapter.chapterNumber = chapterNumber;
    chapter.subTitle = subTitle;
    chapter.description = description;

    await manga.save();

    console.log('Chapter updated successfully:', chapter);
    res.json(chapter);
  } catch (err) {
    console.error('Error updating chapter:', err);
    res.status(500).send('Server error');
  }
};

// Function to delete a chapter
exports.deleteChapter = async (req, res) => {
  const { mangaId, chapterId } = req.params;

  try {
    let manga = await Manga.findById(mangaId);

    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }

    // Check if the logged-in user is the author of the manga
    if (manga.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    let chapter = manga.chapters.id(chapterId);

    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }

    manga.chapters.pull(chapterId); // Remove the chapter from the array

    await manga.save();

    console.log('Chapter deleted successfully');
    res.json({ msg: 'Chapter deleted successfully' });
  } catch (err) {
    console.error('Error deleting chapter:', err);
    res.status(500).send('Server error');
  }
};

