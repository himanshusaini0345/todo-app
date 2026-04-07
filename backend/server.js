require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Todo = require('./models/Todo');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_dev';

mongoose.connect(MONGO_URI)
  .then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
  .catch((err) => {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  });

// Routes
app.get('/api/config', (req, res) => {
  // Feature flag endpoint
  res.json({
    FEATURE_NEW_STATUS: process.env.FEATURE_NEW_STATUS === 'true'
  });
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const data = req.body;
    // Map V1 -> V2
    if ('completed' in data && (!data.status || data.status === 'pending' || data.status === 'completed')) {
      data.status = data.completed ? 'completed' : 'pending';
    }
    // Map V2 -> V1
    if ('status' in data) {
      data.completed = data.status === 'completed';
    }
    const newTodo = new Todo(data);
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // Map V1 -> V2
    if ('completed' in data && !('status' in data)) {
      data.status = data.completed ? 'completed' : 'pending';
    }
    // Map V2 -> V1
    if ('status' in data) {
      data.completed = data.status === 'completed';
    }
    const updated = await Todo.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
