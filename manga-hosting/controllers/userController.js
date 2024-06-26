const User = require('../models/user');
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
  const { username, email, bio } = req.body;
  const profilePicture = req.file ? req.file.path : null;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites', ['title', 'coverImage']);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.favorites.includes(req.params.mangaId)) {
      user.favorites.push(req.params.mangaId);
      await user.save();
    }

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.favorites = user.favorites.filter(
      (favorite) => favorite.toString() !== req.params.mangaId
    );

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMangaById = async (req, res) => {
  const { mangaId } = req.params;

  try {
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ msg: 'Manga not found' });
    }
    res.json(manga);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.followUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToFollow = await User.findById(req.params.userId);

    if (!user || !userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.following.includes(req.params.userId)) {
      user.following.push(req.params.userId);
      userToFollow.followers.push(req.user.id);
      await user.save();
      await userToFollow.save();
    }

    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToUnfollow = await User.findById(req.params.userId);

    if (!user || !userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.following = user.following.filter(
      (follow) => follow.toString() !== req.params.userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== req.user.id
    );

    await user.save();
    await userToUnfollow.save();
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};