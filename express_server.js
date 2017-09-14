"use strict";

// Require and Instantiate express
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./modules/generateRandomString');
const getUserURLs = require('./modules/getUserURLs');

const PORT = process.env.PORT || 8080;

// Flag to determine whether or not to show console.log()s
// Helpful for debugging
const SHOW_LOGS = false;

// Local siteData - only persists while app.js is running server. 
const siteData = {
    userTable: {
        "184d30": {
            id: "184d30",
            userEmail: 'chadgarrett_@hotmail.com',
            userPassword: 'okok' },
        "184d31": {
            id: "184d31",
            userEmail: 'chadder@chadder.com',
            userPassword: 'okok' }
    },
    urlDatabase: {
        'b2xVn2': {
            id: 'b2xVn2',
            longURL: 'http://www.lighthouselabs.ca',
            ownerID: '184d30',
            dateCreated: new Date(),
            visits: 0 },
        '9sm5xK': {
            id: '9sm5xK',
            longURL: 'http://www.google.ca',
            ownerID: '184d31',
            dateCreated: new Date(),
            visits: 0 }
    },
    errorMsgs: []
}

// Set the view engine to ejs
app.set('view engine', 'ejs')

// Setup the body-parser middleware
app.use(bodyParser.urlencoded({extended: true}));

// Setup the cookie-parser middleware
app.use(cookieParser());

// Pass login cookie and urlDatabase to templates using local variables
app.use(function (request, response, next) {
    response.locals = {
        userLoggedInUserID: request.cookies['loggedUserID'],
        userOwnedURLs: getUserURLs(siteData.urlDatabase, request.cookies['loggedUserID'])
    };
    next();
});

// Set home page
/*
 *
 * GET /
 *
 * if user is logged in:
 *  (Minor) redirect to /urls
 * if user is not logged in:
 * 
 *  (Minor) redirect to /login
 * 
 */
app.get('/', (req, res) => {
    if (res.locals.userLoggedInUserID) {
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
})



/*
 * POST /urls
 * 
 * if user is logged in:
 *  generates a short URL, saves it, and associates it with the user
 *  redirects to /urls/:id, where :id matches the ID of the newly saved URL
 * if user is not logged in:
 *  (Minor) returns HTML with a relevant error message
 */
app.post('/urls', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        let randString = generateRandomString();
        if (randString in siteData.urlDatabase) {
            randString = generateRandomString();
        }
        siteData.urlDatabase[randString] = {
            id: randString,
            longURL: req.body.inputLongURL,
            ownerID: res.locals.userLoggedInUserID,
            visits: 0
        }
        return res.redirect('/urls/' + randString);
    } else {
        res.redirect('/login');
    }
})

/*
 * POST /urls/:id
 * 
 * if user is logged in and owns the URL for the given ID:
 *      updates the URL
 *      redirects to /urls
 * if user is not logged in:
 *      (Minor) returns HTML with a relevant error message
 * if user is logged it but does not own the URL for the given ID:
 *      (Minor) returns HTML with a relevant error message
 */
app.post('/urls/:id', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        if (!(req.params.id in siteData.urlDatabase)) {
            siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
            return res.redirect('/urls');           
        }
        if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.userLoggedInUserID) {
            siteData.errorMsgs.push('Sorry, only the owner may update their TinyURLs!');
            return res.redirect('/urls'); 
        }

        siteData.urlDatabase[req.params.id].longURL = req.body.inputLongURL;
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
})



/* 
 * POST /urls/:id/delete
 * 
 * if user is logged in and owns the URL for the given ID:
 *      deletes the URL
 *      redirects to /urls
 * if user is not logged in:
 *      (Minor) returns HTML with a relevant error message
 * if user is logged it but does not own the URL for the given ID:
 *      (Minor) returns HTML with a relevant error message
 */
app.post('/urls/:id/delete', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        if (!siteData.urlDatabase[req.params.id]) {
            siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
            return res.redirect('/urls');            
        } 

        if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.userLoggedInUserID) {
            siteData.errorMsgs.push('Sorry, you may not delete a TinyURL that you are not the owner!');
            return res.redirect('/urls');  
        }

        
        delete siteData.urlDatabase[req.params.id];
        res.redirect('/urls');
    } else {
        res.redirect('/login');
    }
})

/*
 * GET /urls/new
 * 
 * if user is logged in:
 *  returns HTML with:
 *  the site header (see Display Requirements above)
 *  a form which contains:
 *      a text input field for the original (long) URL
 *      a submit button which makes a POST request to /urls
 * if user is not logged in:
 *  redirects to the /login page
 */
app.get('/urls/new', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        res.render('urls_new', { siteData: siteData })
    } else {
        res.redirect('/login');
    }
})


/*
 * GET /urls/:id
 * 
 * if user is logged in and owns the URL for the given ID:
 *  returns HTML with:
 *      the site header (see Display Requirements above)
 *      the short URL (for the given ID)
 *      a form which contains:
 *      the corresponding long URL
 *      an update button which makes a POST request to /urls/:id
 *      (Stretch) the date the short URL was created
 *      (Stretch) the number of times the short URL was visited
 *      (Stretch) the number of unique visits for the short URL
 * if a URL for the given ID does not exist:
 *  (Minor) returns HTML with a relevant error message
 * if user is not logged in:
 *  returns HTML with a relevant error message
 * if user is logged it but does not own the URL with the given ID:
 *  returns HTML with a relevant error message
 */

app.get('/urls/:id', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        if (!(req.params.id in siteData.urlDatabase)) {
            siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
            return res.redirect('/urls');           
        }

        if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.userLoggedInUserID) {
            siteData.errorMsgs.push('Sorry, the requested TinyURL does not belong to you!');
            return res.redirect('/urls'); 
        }

        return res.render('urls_show', { siteData: siteData, currentID: req.params.id })
    } else {
        if (SHOW_LOGS) { console.log('redirecting..'); }
        res.redirect('/login');
    }
})


/*
 * GET /urls
 *
 * if user is logged in:
 *  returns HTML with:
 *  the site header (see Display Requirements above)
 *  a list (or table) of URLs the user has created, each list item containing:
 *  a short URL
 *  the short URL's matching long URL
 *  an edit button which makes a GET request to /urls/:id
 *  a delete button which makes a POST request to /urls/:id/delete
 *  (Stretch) the date the short URL was created
 *  (Stretch) the number of times the short URL was visited
 *  (Stretch) the number number of unique visits for the short URL
 *  (Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new
 *
 * if user is not logged in:
 *  returns HTML with a relevant error message
 */
app.get('/urls', (req, res) => {
    // render `urls.ejs` with all available siteData
    if (res.locals.userLoggedInUserID) {
        res.render('urls_index', {  siteData: siteData,
                                    userOwnedURLs: res.locals.userOwnedURLs })
    } else {
        res.redirect('/login');
    }
})






/*
 * GET /u/:id
 * 
 * if URL for the given ID exists:
 * redirects to the corresponding long URL
 * if URL for the given ID does not exist:
 * (Minor) returns HTML with a relevant error message
 * 
 */
app.get('/u/:id', (req, res) => {
    if (!(req.params.id in siteData.urlDatabase)) {
        siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist in the system!');
        res.status(400);
        return res.redirect('/urls');
    } 
    siteData.urlDatabase[req.params.id].visits += 1;
    res.redirect(siteData.urlDatabase[req.params.id].longURL);
})

/*
 * POST /login
 * 
 * if email and password params match an existing user:
 *      sets a cookie
 *      redirects to /urls
 * if email and password params don't match an existing user:
 *      returns HTML with a relevant error message
 */
app.post('/login', (req, res) => {
    let whiteSpaceRegExp = /^\s*$/;
    for (let userIndex in siteData.userTable) {
        if (SHOW_LOGS) { console.log(userIndex) }
        if (whiteSpaceRegExp.test(req.body.inputEmail) || whiteSpaceRegExp.test(req.body.inputPassword)) {
            siteData.errorMsgs.push('Sorry, you must enter a valid username and email address to login!');
            res.status(400);
            return res.render('login', { siteData: siteData });
        } else if (req.body.inputEmail === siteData.userTable[userIndex].userEmail) {
            if (req.body.inputPassword === siteData.userTable[userIndex].userPassword) {
                res.locals.userLoggedInUserID = siteData.userTable[userIndex].id;
                res.cookie('loggedUserID', siteData.userTable[userIndex].id, { expires: new Date(Date.now() + 900000), httpOnly: true });
                return res.redirect('/');
            } else {
                siteData.errorMsgs.push('Sorry, Username and Password do not match!');
                res.status(403);
                return res.render('login', { siteData: siteData });
            }
        }
    }
    siteData.errorMsgs.push('Sorry, this user does not exist in the database!');
    res.status(403);
    return res.render('login', { siteData: siteData });
})

/*
 * GET /login
 * 
 * if user is logged in:
 *  (Minor) redirects to /urls
 * if user is not logged in:
 *  returns HTML with:
 *      a form which contains:
 *      input fields for email and password
 *      submit button that makes a POST request to /login
 */
app.get('/login', (req, res) => {
    // render `login.ejs` with all available siteData
    if (!res.locals.userLoggedInUserID) {
        if (SHOW_LOGS) { console.log(siteData) }
        res.render('login', { siteData: siteData })
    } else {
        res.redirect('/urls');
    }
})

/*
 * POST /register
 * 
 * if email or password are empty:
 *      returns HTML with a relevant error message
 * if email already exists:
 *      returns HTML with a relevant error message
 * otherwise:
 *      creates a new user
 *      encrypts the new user's password with bcrypt
 *      sets a cookie
 *      redirects to /urls
 */
app.post('/register', (req, res, next) => {
    let whiteSpaceRegExp = /^\s*$/;
    let randID = generateRandomString();

    for (let userIndex in siteData.userTable) {
        if (whiteSpaceRegExp.test(req.body.inputEmail) || whiteSpaceRegExp.test(req.body.inputPassword)) {
            siteData.errorMsgs.push('Sorry, you must enter a valid username and email address to register!');
            res.status(400);
            return res.render('register', { siteData: siteData });
        } else if (req.body.inputEmail === siteData.userTable[userIndex].userEmail) {
            siteData.errorMsgs.push('Sorry, this user already exists in the database!');
            res.status(400);
            return res.render('register', { siteData: siteData });
        } 
    }
    
    res.locals.userLoggedInUserID = randID;
    siteData.userTable[randID] = {
        id: randID,
        userEmail: req.body.inputEmail,
        userPassword: req.body.inputPassword
    }
    res.cookie('loggedUserID', randID, { expires: new Date(Date.now() + 900000), httpOnly: true });
    if (SHOW_LOGS) { console.log(siteData) }
    return res.redirect('/urls');
})

/*
 *
 * GET /register
 * 
 * if user is logged in:
 *  (Minor) redirects to /urls
 * if user is not logged in:
 *  returns HTML with:
 *      a form which contains:
 *      input fields for email and password
 *      a register button that makes a POST request to /register
 * 
 */
app.get('/register', (req, res) => {
    // render `register.ejs` with all available siteData
    if (!res.locals.userLoggedInUserID) {
        res.render('register', { siteData: siteData })
    } else {
        res.redirect('/urls');
    }
})

/*
 * POST /logout
 * 
 * deletes cookie
 * redirects to /urls
 */
app.post('/logout', (req, res) => {
    res.locals.userLoggedInUserID = null;
    res.clearCookie('loggedUserID');
    res.redirect('/urls');
})

app.get('/logout', (req, res) => {
    res.locals.userLoggedInUserID = null;
    res.clearCookie('loggedUserID');
    res.redirect('/urls');
})


app.listen(PORT, () => {
    console.log(`HTTP Server Running - Listening on Port ${PORT}`)
})

