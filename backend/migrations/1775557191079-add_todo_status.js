module.exports = {
  async up(db) {
    console.log("Migration UP: Adding status field based on completed boolean (Batched)");
    
    // Batch process true completions
    const completedTodos = await db.collection('todos').find({ completed: true }).toArray();
    for (let i = 0; i < completedTodos.length; i += 1000) {
      const batch = completedTodos.slice(i, i + 1000).map(t => ({
        updateOne: { filter: { _id: t._id }, update: { $set: { status: 'completed' } } }
      }));
      if (batch.length > 0) await db.collection('todos').bulkWrite(batch);
    }

    // Batch process false completions
    const pendingTodos = await db.collection('todos').find({ completed: false }).toArray();
    for (let i = 0; i < pendingTodos.length; i += 1000) {
      const batch = pendingTodos.slice(i, i + 1000).map(t => ({
        updateOne: { filter: { _id: t._id }, update: { $set: { status: 'pending' } } }
      }));
      if (batch.length > 0) await db.collection('todos').bulkWrite(batch);
    }
  },

  async down(db) {
    console.log("Migration DOWN: Removing status field");
    await db.collection('todos').updateMany({}, { $unset: { status: "" } });
  }
};