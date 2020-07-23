var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (pool) {

  router.get('/', function (req, res) {
    let isSearch = false;
    const page = Number(req.query.page) || 1;
    const {id, str, int, float, startdate, enddate, boolean, cekId, cekString, cekInteger, cekFloat, cekDate, cekBoolean} = req.query
    let query = [];
    if (cekId && id) {
      query.push(`id = '${id}'`);
      isSearch = true
    }
    if (cekString && str) {
      query.push(`stringdata like '%${str}%'`);
      isSearch = true
    }
    if (cekInteger && int) {
      query.push(`integerdata = '${int}'`);
      isSearch = true
    }
    if (cekFloat && float) {
      query.push(`floatdata = '${float}'`);
      isSearch = true
    }
    if (cekBoolean && boolean) {
      query.push(`booleandata = '${boolean}'`);
      isSearch = true
    }
    if (cekDate && startdate && enddate) {
      query.push(`datedata BETWEEN '${startdate}' AND '${enddate}'`);
      isSearch = true
    }

    let search = "";
    if (isSearch) {
      search += `WHERE ${query.join(' AND ')}`;
    }
    console.log(search);

    const limit = 3;
    const offset = (page - 1) * limit;

    let sqlpage = `SELECT COUNT (id) as total FROM bread ${search}`;
    pool.query(sqlpage, (err, data) => {
      if (err) return res.json({
        error: true,
        message: err
      })
      else if (data.rows[0].total == 0) {
        return res.send('Data cannot found')
      }

      const total = Number(data.rows[0].total);
      const pages = Math.ceil(total / limit);

      let sql = `SELECT * FROM bread ${search} ORDER BY id limit $1 offset $2`;
      pool.query(sql, [limit, offset], (err, data) => {
        if (err) {
          return res.send(err)
        } else if (data.rows == 0) {
          return res.send(`data can't be found`)
        } else {
          res.status(200).json({
            data: data.rows.sort((a, b) => a.id - b.id),
            pages,
            page
          })
        }
      })
    })
  });

  router.get('/:id', function (req, res) {
    let id = req.params.id
    pool.query(`SELECT * FROM bread WHERE id = ${id}`, (err, data) => {
      if (err) return res.json(err)
      res.json(data.rows)
    })
  })

  router.post('/', function (req, res) {
    pool.query('INSERT INTO bread (stringdata, integerdata, floatdata, booleandata, datedata) values ($1, $2, $3, $4, $5)', [req.body.stringdata, Number(req.body.integerdata), parseFloat(req.body.floatdata), JSON.parse(req.body.booleandata), req.body.datedata], (err, data) => {
      if (err) return res.json(err)
      res.status(201).json(data)
    })
  });

  router.put('/:id', function (req, res) {
    pool.query('UPDATE bread SET stringdata=$2, integerdata=$3, floatdata=$4, booleandata=$5, datedata=$6 WHERE id=$1', [Number(req.params.id), req.body.stringdata, Number(req.body.integerdata), parseFloat(req.body.floatdata), JSON.parse(req.body.booleandata), req.body.datedata], (err, data) => {
      if (err) return res.json(err)
      res.status(201).json(data.rows)
    })
  })

  router.delete('/:id', function (req, res) {
    pool.query('DELETE FROM bread WHERE id=$1', [Number(req.params.id)], (err, data) => {
      if (err) return res.json(err)
      res.status(201).json(data.rows)
    })
  })

  return router;
}