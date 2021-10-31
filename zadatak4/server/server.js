const { strict } = require("assert");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { SignJWT } = require('jose/jwt/sign');
const {jwtVerify} = require('jose/jwt/verify');
const { generateSecret } = require('jose/util/generate_secret');
const { exportJWK } = require('jose/key/export')
const { importJWK } = require('jose/key/import')

const app = express();
const port = 3081;

let data = {};
let secret = "";
let newID = 0;


const toerr = (msg) => {
    return JSON.stringify({
        status: "err",
        body: msg
    });
}

const took = (obj) => {
    return JSON.stringify({
        status: "ok",
        body: obj
    });
}

const checkToken = async (t) => {
    try{
        const {payload, protectedHeader} = await jwtVerify(t, secret, {
            issuer: 'urn:brains2021:server',
            audience: 'urn:brains2021:server'
        });
        return {valid: true, admin: payload["urn:brains2021:admin"]};
    }catch(err){
        return {valid: false, admin: false};
    }    
}

const checkHeader = async (h) => {
    const a = h.authorization;
    if(!a) return {valid: false, admin: false};
    const [keyword, jwt] = a.split(' ');
    if(keyword != "Bearer") return {valid: false, admin: false};
    return await checkToken(jwt);
}

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cors());

app.post('/app/login', async (req, res) => {
    const {username, password} = req.body;
    if(data.logins[username] && data.logins[username].password == password){
        const jwt = await new SignJWT({'urn:brains2021:admin': data.logins[username].admin})
            .setProtectedHeader({alg: 'HS256'})
            .setIssuedAt()
            .setIssuer('urn:brains2021:server')
            .setAudience('urn:brains2021:server')
            .setExpirationTime('2h')
            .sign(secret);
        const obj = {
            username: username,
            admin: data.logins[username].admin,
            jwt: jwt
        }
        res.send(took(obj));
    }else{
        res.send(toerr("Incorrect login details."));
    }
});


app.get('/app/book/:id', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    res.send(took(data.books.find(n => n.id == req.params.id)));
});

app.get('/app/books/:from/:to', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    let obj = {
        results: data.books.slice(req.params.from - 1, Math.min(Number(req.params.to), data.books.length)),
        length: data.books.length
    }
    res.send(took(obj));
});


app.get('/app/books/search/:q/:from/:to', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    let rez = null;
    if(req.params.q.length === 0){
        rez = data.books;
    }else{
        rez = data.books.filter(n => {
            for(let k of Object.keys(n)) if(n[k].toString().includes(req.params.q)) return true;
            return false;
        });
    }
    const obj = {
        results: rez.slice(req.params.from - 1, Math.min(Number(req.params.to), rez.length)),
        length: rez.length
    };
    res.send(took(obj));
});

app.get('/app/books/searchByAuthor/:q/:from/:to', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    let rez = null;
    if(req.params.q.length === 0){
        rez = data.books;
    }else{
        rez = data.books.filter(n => {
            for (let a of n.authors) if(a.toString().includes(req.params.q)) return true;
            return false;
        });
    }
    const obj = {
        results: rez.slice(req.params.from - 1, Math.min(Number(req.params.to), rez.length)),
        length: rez.length
    };
    res.send(took(obj));
});

app.post('/app/books/new', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    obj = req.body; 
    obj.id = newID++;
    data.books.push(obj);
    res.send(took(obj));
});

app.post('/app/register', async (req, res) => {
    obj = req.body;
    if(data.logins[obj.username]){
        res.send(toerr("User already exists."));
    }else{
        data.logins[obj.username] = obj;
        res.send(took(obj));
    }
});

app.get('/app/checkUsername/:username', async (req, res) => {
    const username = req.params.username;
    if(data.logins[username]){
        res.send(took(true));
    }else{
        res.send(took(false));
    }
});

app.put('/app/books/:id', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    const ix = data.books.findIndex(n => n.id == req.params.id);
    if(ix == -1){
        res.send(toerr("Element with given id does not exist."));
        return;
    }else{
        data.books[ix] = req.body; 
        res.send(took(data.books[ix]));
    }
});

app.delete('/app/books/:id', async (req, res) => {
    if((!await checkHeader(req.headers)).valid){
        res.send(toerr("Not logged in!"));
        return;
    }
    const ix = data.books.findIndex(n => n.id == req.params.id);
    if(ix == -1){
        res.send(toerr("Element with given id does not exist."));
        return;
    }else{
        const stored = data.books[ix];
        data.books.splice(ix, 1);
        res.send(took(stored));
    }
});


fs.readFile("books.json", {encoding: 'utf-8'}, async (err, dataString) => {
    const secretData = fs.readFileSync("secret.json", {encoding: 'utf-8'});
    data = JSON.parse(dataString);
    newID = 0;
    for(c of data.books){
        if(Number(c.id) > newID) newID = c.id;
    }
    newID++;
    secret = await importJWK(JSON.parse(secretData), "HS256");
    app.listen(port, console.log(`Server je na portu ${port}.`));
});


