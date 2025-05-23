const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Create a blog post (authenticated)
router.post('/', auth, async (req, res) => {
  const { title, content, is_public } = req.body;
  const userId = req.user.userId;

  try {
    await pool.query(
      'INSERT INTO posts (title, content, is_public, user_id) VALUES (?, ?, ?, ?)',
      [title, content, is_public, userId]
    );
    res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts created by the logged-in user (authenticated)
router.get('/myposts', auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [posts] = await pool.query(
      `SELECT id, title, content, is_public, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your posts' });
  }
});

// Get all public posts with optional search filter
router.get('/get', async (req, res) => {
  try {
    const search = req.query.search || '';
    const searchTerm = `%${search}%`;

    const query = `
      SELECT posts.id, title, LEFT(content, 100) AS summary, created_at, username AS author, is_public
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE is_public = TRUE AND (title LIKE ? OR content LIKE ?)
      ORDER BY posts.created_at DESC
    `;

    const [posts] = await pool.query(query, [searchTerm, searchTerm]);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID (no auth; public or private - optional to restrict)
router.get('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT posts.id, title, content, created_at, username AS author, is_public
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `, [req.params.id]);

    if (!result.length) return res.status(404).json({ error: 'Post not found' });

    const post = result[0];
    
    // Optionally, if you want to restrict private posts to owners only, 
    // you can add auth middleware here and check ownership or is_public flag.

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Edit a post (authenticated and ownership check)
router.put('/:id', auth, async (req, res) => {
  const { title, content, is_public } = req.body;
  const postId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    if (rows[0].user_id !== req.user.userId)
      return res.status(403).json({ error: 'Not authorized' });

    await pool.query(
      'UPDATE posts SET title = ?, content = ?, is_public = ? WHERE id = ?',
      [title, content, is_public, postId]
    );

    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete a post (authenticated and ownership check)
router.delete('/:id', auth, async (req, res) => {
  const postId = req.params.id;
  try {
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!existing.length) return res.status(404).json({ error: 'Post not found' });
    if (existing[0].user_id !== req.user.userId)
      return res.status(403).json({ error: 'Not authorized' });

    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;
