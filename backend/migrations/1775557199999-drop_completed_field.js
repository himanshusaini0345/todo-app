module.exports = {
  async up(db) {
    console.log("Migration UP: Dropping 'completed' boolean field");
    await db.collection('todos').updateMany({}, { $unset: { completed: "" } });
  },

  async down(db) {
    console.log("Migration DOWN: Restoring 'completed' boolean field based on status");
    // Batch process true completions
    const completedTodos = await db.collection('todos').find({ status: 'completed' }).toArray();
    for (let i = 0; i < completedTodos.length; i += 1000) {
      const batch = completedTodos.slice(i, i + 1000).map(t => ({
        updateOne: { filter: { _id: t._id }, update: { $set: { completed: true } } }
      }));
      if (batch.length > 0) await db.collection('todos').bulkWrite(batch);
    }

    // Batch process false completions
    const pendingTodos = await db.collection('todos').find({ status: { $ne: 'completed' } }).toArray();
    for (let i = 0; i < pendingTodos.length; i += 1000) {
      const batch = pendingTodos.slice(i, i + 1000).map(t => ({
        updateOne: { filter: { _id: t._id }, update: { $set: { completed: false } } }
      }));
      if (batch.length > 0) await db.collection('todos').bulkWrite(batch);
    }
  }
};
