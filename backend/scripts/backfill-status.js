require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Todo = require('../models/Todo');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_dev';
const isRollback = process.argv.includes('--rollback');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);

    if (isRollback) {
      console.log('🔄 Rolling back: Removing "status" field from all todos...');
      const result = await Todo.updateMany({}, { $unset: { status: "" } });
      console.log(`✅ Rollback complete. Updated ${result.modifiedCount} documents.`);
    } else {
      console.log('🚀 Backfilling: Populating "status" field based on "completed" status...');
      const completedResult = await Todo.updateMany(
        { completed: true, status: { $exists: false } },
        { status: 'completed' }
      );
      const pendingResult = await Todo.updateMany(
        { completed: false, status: { $exists: false } },
        { status: 'pending' }
      );
      console.log(`✅ Backfill complete. Updated ${completedResult.modifiedCount + pendingResult.modifiedCount} documents.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
