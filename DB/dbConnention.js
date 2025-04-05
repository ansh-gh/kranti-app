const mongoose = require('mongoose');
require('dotenv').config()

const dbConnection = async () => {
    try {
        const DBURI=process.env.MONGO_URI
        await mongoose.connect(DBURI);
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); 
    }
};

module.exports = dbConnection;
