module.exports = {
  async up(db) {
    console.log("Migration UP: Dropping 'completed' boolean field");
    await db.collection('todos').updateMany({}, { $unset: { completed: "" } });
  },
  async down(db) {
    console.log("Migration DOWN: Restoring 'completed' field based on status");
    const cursor = db.collection('todos').find();
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      await db.collection('todos').updateOne(
        { _id: doc._id },
        { $set: { completed: doc.status === 'completed' } }
      );
    }
  }
};
