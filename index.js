const express       = require('express');
const multer        = require('multer');
const uidSafe       = require('uid-safe');
const path          = require('path');
const bodyParser    = require('body-parser');
const db            = require('./db.js');
const s3            = require('./s3.js');
const s3url         = require('./config.json');


const app = express();

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24)
            .then(function(uid) {
                callback(null, uid + path.extname(file.originalname));
            });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());




app.use(express.static('public'));

app.get('/images', (req, res) => {
    db.getImages()
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.get('/modal/:id', (req, res) => {
    db.getImageById(req.params.id)
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {
            console.log(err);
            res.json("error");
        });
});

app.get('/moreimages/:id', (req, res) => {
    db.getMoreImages(req.params.id)
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.get('/lastimage', (req, res) => {
    db.lastImage()
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.get('/latestimage', (req, res) => {
    db.latestImage()
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.get('/previmages/:id', (req, res) => {
    db.getPrevImages(req.params.id)
        .then((data) => {
            res.json(data.rows.reverse());
        }).catch(err => {console.log(err);});
});

app.get('/comments/:id', (req, res) => {
    db.getCommentsById(req.params.id)
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.post('/comments/', (req, res) => {
    db.addComment(req.body.comment, req.body.user, req.body.image_id)
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});





app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    const imgUrl = `${s3url.s3Url}${req.file.filename}`;
    db.addImage(req.body.title, req.body.desc, req.body.user, imgUrl)
        .then((data) => {
            res.json(data.rows);
        }).catch(err => {console.log(err);});
});

app.post('/delete/:id', (req, res) => {
    db.deleteImage(req.params.id)
        .then(() => {
            res.redirect('/');
        }).catch((err) => {console.log(err);});
});

app.listen(process.env.PORT || 8080, () => console.log("Listening!"));
