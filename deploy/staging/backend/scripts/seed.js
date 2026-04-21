const mongoose = require('mongoose');
const Todo = require('../models/Todo');

const MONGODBS = [
  'mongodb://127.0.0.1:27017/todo_dev',
  'mongodb://127.0.0.1:27017/todo_staging',
  'mongodb://127.0.0.1:27017/todo_prod'
];

async function seed() {
  for (const uri of MONGODBS) {
    try {
      await mongoose.connect(uri);
      console.log(`Connected to ${uri}`);
      
      await Todo.deleteMany({});
      await Todo.create([
        { title: 'Learn Zero-Downtime Deployments', completed: true },
        { title: 'Write Migration Scripts', completed: false },
        { title: 'Test Fallback Mechanisms', completed: false }
      ]);
      console.log(`Seeded ${uri}`);
      await mongoose.disconnect();
    } catch (err) {
      console.error(err);
    }
  }
}

seed().then(() => {
  console.log('Seeding complete.');
  process.exit(0);
});
