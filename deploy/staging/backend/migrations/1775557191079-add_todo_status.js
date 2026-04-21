module.exports = {
  async up(db) {
    console.log('Migration UP: Adding status field based on completed boolean (Batched)');
    const cursor = db.collection('todos').find({ status: { $exists: false } });
    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const status = doc.completed ? 'completed' : 'pending';
      await db.collection('todos').updateOne({ _id: doc._id }, { $set: { status: status } });
      count++;
    }
    console.log(`Updated ${count} documents.`);
  },
  async down(db) {
    console.log('Migration DOWN: Removing status field');
    await db.collection('todos').updateMany({}, { $unset: { status: "" } });
  }
};
