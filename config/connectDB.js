import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log('DB is connected ^_^');
    } catch (error) {
        console.log('Failed to connect ', error);
    }
};

export default connectDB;
