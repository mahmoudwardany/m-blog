const mongoose = require('mongoose');
const connectDB = async (req, res) => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('DB is connect ^_^');
  } catch (error) {
    console.log('failed to connect ', error);
  }
};
module.exports = connectDB;