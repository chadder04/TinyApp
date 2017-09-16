"use strict";

// Required modules
const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const generateRandomString = require('./modules/generateRandomString');
const getUserURLs = require('./modules/getUserURLs');
const getURLVisits = require('./modules/getURLVisits');

const app = express();
const PORT = 8080;

const siteData = {
  userTable: {},
  urlDatabase: {},
  urlVisitsDatabase: [],
  errorMsgs: []
};

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Setup the body-parser middleware
app.use(bodyParser.urlencoded({extended: true}));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// Setup the cookie-session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key']
}));

app.use(function (req, res, next) {
  res.locals.isLoggedIn = false;

  if (req.session.userID && req.session.userID in siteData.userTable) {
    res.locals.user = siteData.userTable[req.session.userID];
    res.locals.isLoggedIn = true;
  }
  
  next();
});

/*
 *
 * GET /
 *
 * if user is logged in:
 *  (Minor) redirect to /urls
 * if user is not logged in:
 *  (Minor) redirect to /login
 * 
 */
app.get('/', (req, res) => {
  if (res.locals.isLoggedIn) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});



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
  if (res.locals.isLoggedIn) {
    let randString = generateRandomString();
    if (randString in siteData.urlDatabase) {
      randString = generateRandomString();
    }
    siteData.urlDatabase[randString] = {
      id: randString,
      longURL: req.body.inputLongURL,
      ownerID: res.locals.user.id,
      dateCreated: new Date(),
      visits: 0,
      uniqueVisitorIDs: new Set()
    };
    return res.redirect('/urls/' + randString);
  } else {
    siteData.errorMsgs.push('Error - you must be signed in to save a new TinyURL!');
    return res.redirect('/login');
  }
});

/*
 * PUT /urls/:id
 * 
 * if user is logged in and owns the URL for the given ID:
 *      updates the URL
 *      redirects to /urls
 * if user is not logged in:
 *      (Minor) returns HTML with a relevant error message
 * if user is logged it but does not own the URL for the given ID:
 *      (Minor) returns HTML with a relevant error message
 */
app.put('/urls/:id', (req, res) => {
  if (res.locals.isLoggedIn) {
    if (!(req.params.id in siteData.urlDatabase)) {
      siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
      return res.redirect('/urls');
    }
    if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.user.id) {
      siteData.errorMsgs.push('Sorry, only the owner may update their TinyURLs!');
      return res.redirect('/urls');
    }

    siteData.urlDatabase[req.params.id].longURL = req.body.inputLongURL;
    return res.redirect('/urls');
  } else {
    siteData.errorMsgs.push('Sorry, you must be signed in to update TinyURL addresses!');
    return res.redirect('/login');
  }
});



/* 
 * DELETE /urls/:id/
 * 
 * if user is logged in and owns the URL for the given ID:
 *      deletes the URL
 *      redirects to /urls
 * if user is not logged in:
 *      (Minor) returns HTML with a relevant error message
 * if user is logged it but does not own the URL for the given ID:
 *      (Minor) returns HTML with a relevant error message
 */
app.delete('/urls/:id', (req, res) => {
  if (res.locals.isLoggedIn) {
    if (!siteData.urlDatabase[req.params.id]) {
      siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
      return res.redirect('/urls');
    }

    if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.user.id) {
      siteData.errorMsgs.push('Sorry, you may not delete a TinyURL that you are not the owner!');
      return res.redirect('/urls');
    }

    delete siteData.urlDatabase[req.params.id];
    return res.redirect('/urls');
  } else {
    siteData.errorMsgs.push('Sorry, you must be signed in to delete TinyURL addresses!');
    return res.redirect('/login');
  }
});

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
  if (res.locals.isLoggedIn) {
    res.render('urls_new', { siteData: siteData });
  } else {
    res.redirect('/login');
  }
});


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
  if (res.locals.isLoggedIn) {
    if (!(req.params.id in siteData.urlDatabase)) {
      siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist!');
      return res.redirect('/urls');
    }

    if (siteData.urlDatabase[req.params.id].ownerID !== res.locals.user.id) {
      siteData.errorMsgs.push('Sorry, the requested TinyURL does not belong to you!');
      return res.redirect('/urls');
    }

    return res.render('urls_show', { siteData: siteData, currentID: req.params.id, visitHistory: getURLVisits(siteData.urlVisitsDatabase, req.params.id) });
  } else {
    siteData.errorMsgs.push('Sorry, you must be logged in to view this TinyURL record!');
    res.redirect('/login');
  }
});


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
 *  (Stretch) the number of unique visits for the short URL
 *  (Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new
 *
 * if user is not logged in:
 *  returns HTML with a relevant error message
 */
app.get('/urls', (req, res) => {
  if (res.locals.isLoggedIn) {
    res.render('urls_index', {  siteData: siteData, userOwnedURLs: getUserURLs(siteData.urlDatabase, res.locals.user.id) });
  } else {
    siteData.errorMsgs.push('Sorry, you must be logged in to view your TinyURL records!');
    res.redirect('/login');
  }
});






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
  let visitorID;
  if (!(req.params.id in siteData.urlDatabase)) {
    siteData.errorMsgs.push('Sorry, the requested TinyURL does not exist in the system!');
    res.status(400);
    return res.redirect('/urls');
  }
  if (res.locals.isLoggedIn) {
    visitorID = res.locals.user.id;
  } else {
    if (req.session.visitorID) {
      visitorID = req.session.visitorID;
    } else {
      let randID = generateRandomString();
      visitorID = randID;
    }
  }
    
  siteData.urlVisitsDatabase.push({
    visitorID: visitorID,
    shortURL: req.params.id,
    dateVisited: new Date()
  });
  siteData.urlDatabase[req.params.id].visits += 1;
  siteData.urlDatabase[req.params.id].uniqueVisitorIDs.add(visitorID);
  res.redirect(siteData.urlDatabase[req.params.id].longURL);
});

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
    if (whiteSpaceRegExp.test(req.body.inputEmail) || whiteSpaceRegExp.test(req.body.inputPassword)) {
      siteData.errorMsgs.push('Sorry, you must enter a valid username and email address to login!');
      res.status(400);
      return res.render('login', { siteData: siteData });
    } else if (req.body.inputEmail === siteData.userTable[userIndex].userEmail) {
      if (bcrypt.compareSync(req.body.inputPassword, siteData.userTable[userIndex].userPassword)) {
        req.session.userID = userIndex;
        res.locals.user = siteData.userTable[userIndex];
        return res.redirect('/');
      } else {
        siteData.errorMsgs.push('Sorry, username or password are incorrect!');
        res.status(403);
        return res.render('login', { siteData: siteData });
      }
    }
  }
  siteData.errorMsgs.push('Sorry, this user does not exist in the database!');
  res.status(403);
  return res.render('login', { siteData: siteData });
});

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
  if (!res.locals.isLoggedIn) {
    res.render('login', { siteData: siteData });
  } else {
    res.redirect('/urls');
  }
});

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
    }
    if (req.body.inputEmail === siteData.userTable[userIndex].userEmail) {
      siteData.errorMsgs.push('Sorry, this user already exists in the database!');
      res.status(400);
      return res.render('register', { siteData: siteData });
    }
  }
    
  siteData.userTable[randID] = {
    id: randID,
    userEmail: req.body.inputEmail,
    userPassword: bcrypt.hashSync(req.body.inputPassword, 10)
  };

  return res.redirect('/urls');
});

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
  if (!res.locals.isLoggedIn) {
    res.render('register', { siteData: siteData });
  } else {
    res.redirect('/urls');
  }
});

/*
 * POST /logout
 * 
 * deletes cookie
 * redirects to /urls
 */
app.post('/logout', (req, res) => {
  res.locals.isLoggedIn = false;
  req.session = null;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  res.locals.isLoggedIn = false;
  req.session = null;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`HTTP Server Running - Listening on Port ${PORT}`);
});

