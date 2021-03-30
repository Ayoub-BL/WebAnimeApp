const express = require('express');
const router = express.Router();

const {ensureAuthenticated, forwardAuthenticated} = require('../config/auth');

// Anime Modele
const Anime = require('../models/Anime');


// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// home Page
router.get('/home', ensureAuthenticated, (req, res, next) => {
    Anime.find({}, (err, returnValue) => {
        if (err) {
            console.log(err);
        } else {
            res.render('home', {
                returnValue: returnValue,
                user: req.user
            })
        }
    });
});


//Edit home Handler
router.post('/edithome', (req, res) => {
    const _id = req.body['idAnime'];
    const _animeImage = req.body['animeImage'];
    const _title = req.body['title'];
    const _category = req.body['category'];
    const _description = req.body['description'];
    console.log('editHome: ', _id, _animeImage, _title, _category, _description);
    res.render('edit', {
        e_id: _id,
        e_animeImage: _animeImage,
        e_title: _title,
        e_category: _category,
        e_description: _description
    })
});

// home Page
router.get('/edit', ensureAuthenticated, (req, res) => {
     const bod = req.body;
     /*const ee_animeImage = ;
     const ee_title = req.body['title'];
     const ee_category = req.body['category'];
     const ee_description = req.body['description'];*/
    console.log('edit==>: ',bod);
     res.render('edit', {
         bod:bod
     })
});


/*
Anime.updateOne({_id:anime._id},anime,(err)=>{
    if(err){console.log(err); }
    else{
        res.redirect('/home');

    }
});
*/


//delete Handler
router.post('/delete', (req, res) => {
    const id = req.body['idAnime'];

    Anime.deleteOne({_id: id}, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/home');
        }

    });
});

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.filename() + '-' + Date.now() + '.jpg')
    }
});

let upload = multer({ storage: storage }).single('avatar');

// uploadImage Page
router.get('/uploadImage', ensureAuthenticated, (req, res) => res.render('uploadImage'));

// uploadImage Handler
router.post('/uploadImage', function(req, res) {
    console.log("/uploadImage");
    let animeImage = req.file.filename();
    if (!animeImage) {
        errors.push({msg: 'Please choose an image!'});
    }
    if (errors.length > 0) {
        res.render('add', { animeImage });
    }
    else {
        upload(req, res, function (err) {
            if(err){
                errors.push({msg: 'Upload image field!'});
                res.render('add', { animeImage });
            }
            else {
                req.flash(
                    'success_msg',
                    'Image ', animeImage, ' was uploaded successfully'
                );
            }
        });
    }
});

// Add Page
router.get('/add', ensureAuthenticated, (req, res) => {
    console.log("GET /add");
    res.render('add');
});

// Add Handler
router.post('/add', function(req, res) {
    console.log("POST /add");

    let errors = [];
    /*
    upload(req, res, function (err) {
        if(err){
            console.log("err=" + err);
            errors.push({msg: 'Upload image field!'});
            res.render('add');
        }
        else {
            console.log("else err=" + err);
            let animeImage = req.body.animeImage;
            if (!animeImage) {
                errors.push({msg: 'Please choose an image!'});
            }
            else {
                errors.push({msg: 'Please enter all fields'});
            }
        }
    });

        if (errors.length > 0) {
        res.render('add', { animeImage });
    }
    else {
        req.flash('success_msg', 'Image ', animeImage, ' was uploaded successfully');
    }
    */

    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    if ( !title || !category || !description ) {
        errors.push({msg: 'Please enter all fields'});
    }
    if (errors.length > 0) {
        res.render('add', { errors, category, title, description});
    }
    else {
        let image = 'anime_default.jpg';
        const newAnime = new Anime({ image, title, category, description});
        newAnime.save()
            .then(() => {
                req.flash(
                    'success_msg',
                    'Anime ', title, ' was added successfully'
                );

                res.redirect('/home');
            })
            .catch(err => console.log(err));
    }

});


module.exports = router;