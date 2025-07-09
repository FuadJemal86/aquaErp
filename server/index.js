import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRouter from './Routes/adminRoute.js';

dotenv.config();


const app = express()


app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    credentials: true,
}));


app.use('/admin', adminRouter)




app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});