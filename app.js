const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoute');
const productRoutes = require('./routes/productRoute');
const expressValidator = require('express-validator');
require('dotenv').config();


//app
const app = express();


//db
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));


//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());  
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());


//routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);



const port = process.env.PORT || 8000;

app.listen(port, ()=> {
  console.log(`Server is running on port ${port}`);
})