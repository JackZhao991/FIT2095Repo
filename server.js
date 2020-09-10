const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const moment = require('moment');
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const Author = require('./models/author');
const Book = require('./models/book');

const app = express();

const url = 'mongodb://localhost:27017/libDB';

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.set('port', 8080);

app.use(express.static('resources'));

app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.connect(url, {useNewUrlParser: true}, {useUnifiedTopology: true}, (err) => {
    if (err) {
        console.log('Error: ' + err);
        throw err;
    }
    console.log('Successfully connected');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/newauthor', (req, res) => {
    res.sendFile(__dirname + '/views/newauthor.html');
});

app.post('/addauthor', (req, res) => {
    let author = req.body;

    let newAuthor = new Author({
        _id: new mongoose.Types.ObjectId(),
        name: {
            firstName: author.fname,
            lastName: author.lname
        },
        dob: author.dob,
        address: {
            state: author.state,
            suburb: author.suburb,
            street: author.street,
            unit: author.unit
        },
        numBooks: author.numbooks
    });

    newAuthor.save((err) => {
        if (err) {
            console.log("Error: " + err);
            res.redirect('/newauthor');
        } else {
            console.log('Author successfully added to database');
            res.redirect('/listauthors');
        }
    });
});

app.get('/listauthors', (req, res) => {
    Author.find({}, (err, docs) => {
        if (!err)
        res.render('listauthor.html', {
            authors: docs
        });
    });
});

app.get('/newbook', (req, res) => {
    let randomisbn = randomstring.generate({
        length: 13,
        charset: 'numeric'
    });
    res.render('newbook.html', {
        randomisbn: randomisbn
    });
});

app.post('/addbook', (req, res) => {
    let book = req.body;

    let newBook = new Book({
        _id: new mongoose.Types.ObjectId(),
        title: book.title,
        author: mongoose.Types.ObjectId(book.authorID),
        isbn: book.isbn,
        published: book.dop,
        summary: book.summary
    });

    Author.findByIdAndUpdate(newBook.author, {$inc: {'numBooks': 1}}, (err, doc) => {
        if (!err) {
            console.log('Author updated');
            newBook.save((err) => {
                if (!err) {
                    console.log('Book successfully added to database');
                    res.redirect('/listbooks');
                } else {
                    console.log("Error: " + err);
                    res.redirect('/newbook');
                }
            });
        } else {
            console.log(err);
            res.redirect('/newbook');
        }
    });

    /* newBook.save((err) => {
        if (err) {
            console.log("Error: " + err);
            res.redirect('/newbook');
        } else {
            console.log('Book successfully added to database');
            Author.updateOne({'_id': newBook.author}, {$inc: {'numBooks': 1}}, {runValidators: true}, (err, doc) => {
                if (!err) {
                    console.log('Author updated');
                }
            });
            res.redirect('/listbooks');
        }
    }); */
});

app.get('/listbooks', (req, res) => {
    Book.find({}).populate('author').exec( (err, docs) => {
        if (!err){
            res.render('listbook.html', {
                books: docs
            });
        } else {
            console.log(err);
            res.redirect('/listbooks');
        }
    });
});

app.get('/updateauthor', (req, res) => {
    res.sendFile(__dirname + '/views/updateauthor.html');
});

app.post('/updatenumbooks', (req, res) => {
    let numBook = req.body;
    Author.findByIdAndUpdate(mongoose.Types.ObjectId(numBook.authorID), {$set: {'numBooks': numBook.numbooks}}, {runValidators: true}, (err, doc) => {
        if(!err) {
            console.log('Author updated');
            res.redirect('/listauthors');
        } else {
            console.log('Error: ' + err);
            res.redirect('/updateauthor');
        }
        
    })
})

/* app.get('/updatebook', (req, res) => {
    res.sendFile(__dirname + '/views/updatebook.html');
});

app.post('/updatebookinfo', (req, res) => {
    let bookupdate = req.body;
    console.log(bookupdate);
    res.redirect('/listbooks');
}); */

app.get('/deletebook', (req, res) => {
    res.sendFile(__dirname + '/views/deletebook.html');
});

app.post('/delete', (req, res) => {
    let isbn = req.body.isbn;

    Book.deleteOne({'isbn': isbn}, (err, doc) => {
        if (!err) {
            console.log('Book deleted');
            res.redirect('/listbooks');
        } else {
            console.log('Err ' + err);
        }
    })
});

app.listen(app.get('port'));