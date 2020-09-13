const express = require('express');
const cors = require('cors');
const cookiepParser = require('cookie-parser');
const models = require('./models');
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiepParser());

app.use('/auth', require('./routes/api/auth/index'));

app.get('/test', (req, res) => {
    console.log('test success');
    res.status(200).json({ message: 'success' });
});

models.sequelize
    .sync()
    .then(() => {
        console.log('Success to connect to DB.');
    })
    .catch((err) => {
        console.log('Fail to connect to DB.');
        console.log(err);
    });

app.listen(5000, (req, res) => {
    console.log('server successfully start');
});
