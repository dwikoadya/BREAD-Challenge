const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const app = express()

let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE);


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    const { cekid, id, cekstr, str, cekint, int, cekflo, float, cekdate, startDate, endDate,  cekboo, boolean } = req.query;
    let src = false
    let query = []

    if (cekid && id) {
        query.push(`ID = '${id}'`)
        src = true;
    }
    if (cekstr && str) {
        query.push(`String like'${str}'`)
        src = true
    }
    if (cekint && int) {
        query.push(`Integer = '${int}'`)
        src = true
    }
    if (cekflo && float) {
        query.push(`Float = '${float}'`)
        src = true
    }
    if (cekdate && startDate && endDate) {
        query.push(`Date = BETWEEN '${startDate}' AND '${endDate}'`)
        src = true
    }
    if (cekboo && boolean) {
        query.push(`Boolean = '${boolean}'`)
    }

    let search = ""
    if (src) {
        search += `WHERE ${query.join(' AND ')} `
    }

    const limit = 3
    const page = req.query.page || 1
    const offset = (page - 1) * limit

db.all(`SELECT COUNT (ID) as total FROM data`, ( err, rows) => {
    if (err) {
        throw err
    } else if (rows === 0) {
        return res.send('Error! data not found')
    } else {
        total = rows[0].total
        const pages = Math.ceil(total/limit)

        let sql = `SELECT * FROM data ${search} LIMIT ? OFFSET ?`;
        db.all(sql, [limit,offset], (err, rows) => {
            if (err) {
                throw err
            } else if (rows === 0) {
                return res.send(`Can't found data`) 
            } else {
                let result = [];
                rows.forEach((row) => {
                    result.push(row)
                })
                res.render('home', { result, page, pages })
            }
        })
    }
        
    })
})


app.get('/add', (req, res) => res.render('add'))
app.post('/add', (req, res) => {
    let string = req.body.str;
    let integer = req.body.int;
    let float = req.body.float;
    let date = req.body.date;
    let boolean = req.body.boolean;

    db.serialize(() => {
        let sql = `INSERT INTO data (String, Integer, Float, Date, Boolean) VALUES ('${string}', ${integer}, ${float}, '${date}', '${boolean}')`
        db.run(sql, (err) => {
            if (err) throw err;
        })
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM data WHERE ID = ${id}`
    db.run(sql, (err) => {
        if (err) throw err;
    })
    res.redirect('/')
})

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let sql = `SELECT * FROM data WHERE ID = ${id}`
    db.get(sql, (err, row) => {
        if (err) {
            return console.error(err.message)
        }
        res.render('edit', { row })
    })
})

app.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    let string = req.body.str;
    let integer = req.body.int;
    let float = req.body.float;
    let date = req.body.date;
    let boolean = req.body.boolean;
    let sql = `UPDATE data SET String = '${string}', Integer = ${integer}, Float = ${float}, Date = '${date}', Boolean = '${boolean}' WHERE ID = ${id}`
    db.run(sql, (err) => {
        if (err) throw err
    })
    res.redirect('/')
})

app.listen(3000)