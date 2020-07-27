var express = require('express');
var router = express.Router();

//require moment
var moment = require('moment');

//require mongodb
const objectId = require('mongodb').ObjectId;

/* GET home page. */

//Membuat Router '/' GET => List, Search and Pagination
module.exports = (db, coll) => {
  router.get('/', function (req, res, next) {
    const { checkId, id, checkString, string, checkInteger, integer, checkFloat, float, checkBool, bool, checkDate, startDate, endDate } = req.query;
    let query = new Object();
    const reg = new RegExp(string);

    if (checkId && id) {
      query._id = id;
    }
    if (checkString && string) {
      query.string = reg;
    }
    if (checkInteger && integer) {
      query.integer = parseInt(integer);
    }
    if (checkFloat && float) {
      query.float = parseFloat(float);
    }
    if (checkBool && bool) {
      query.boolean = JSON.parse(bool);
    }
    if (checkDate && startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const page = req.query.page || 1;
    const limit = 3;

    const offset = (page - 1) * limit;

    //New Page by Pagination
    let url = req.url.includes('page') ? req.url : `/?page=1&` + req.url.slice(2)

    //Use Promise
    db.collection(coll).count()
      .then((total) => {
        const pages = Math.ceil(total / limit)

        db.collection(coll).find(query).limit(limit).skip(offset).toArray()
          .then((result) => {

            res.status(200).render('index', {
              moment,
              result,
              page,
              pages,
              url
            })
              .catch((err) => {
                res.status(500).json({
                  error: true,
                  message: err
                })
              })
          })
      })
  });

  //Membuat Router '/add' => Add Data
  router.get('/add', (req, res) => {res.status(200).render('add') });

  router.post('/add', (req, res) => {
    const add = { "string": req.body.stringdata, "integer": parseInt(req.body.integerdata), "float": parseFloat(req.body.floatdata), "date": req.body.datedata, "boolean":JSON.parse(req.body.booleandata)}

    db.collection(coll).insertOne(add)
    .then(() => res.redirect('/'))
    .catch(err =>
      res.status(500).json({
        error: true,
        message: err
      }))
  });

  //Membuat Router '/delete/:id' => Delete Data
  router.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    db.collection(coll).deleteOne({ _id: objectId(id) })
      .then(() => res.redirect('/'))
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  });

  //Membuat Router '/edit/:id' Method : GET => Edit Data
  router.get('/edit/:id', (req,res) => {

    const id = req.params.id;

    db.collection(coll).findOne({ _id: objectId(id) })
      .then((result) =>{
        res.render('edit', { row: result })
      })
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  })

  //Membuat Router '/edit/:id' Method : POST => Edit Data
  router.post('/edit/:id', (req,res) => {

    const id = req.params.id;

    db.collection(coll).updateOne(
      { _id: objectId(id) },
      {
        $set: {
          string : req.body.string, 
          integer : parseInt(req.body.integer), 
          float : parseFloat(req.body.float), 
          date : req.body.date, 
          boolean : JSON.parse(req.body.boolean)
        }
      })
      .then((result) => res.redirect('/'))
      .catch((err) => {
        res.status(500).json({
          error: true,
          message: err
        })
      })
  })
  return router;
}