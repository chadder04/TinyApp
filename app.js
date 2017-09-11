// Require and Instantiate express
const app = require('express')()

// Local siteData - only persists while app.js is running server. 
const siteData = {
    isUserLoggedIn: function () {
        return false;
    },
    userLoggedIn: false,
    userLoggedInEmail: 'chadgarrett_@hotmail.com',
    userSessionData: [],
    userTable: [
        {
            id: 1,
            userLoginName: 'chadder04',
            userFullName: 'Chad Garrett',
            userPassword: '123456',
            userEmail: 'chadgarrett_@hotmail.com'

        }
    ]
}

// Set the view engine to ejs
app.set('view engine', 'ejs')

// Set home page
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
    // render `home.ejs` with all available siteData
    if (siteData.isUserLoggedIn()) {
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
    } else {
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
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
    if (siteData.isUserLoggedIn()) {
        res.render('urls', { siteData: siteData })
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
    if (!siteData.isUserLoggedIn()) {
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
app.post('/register', (req, res) => {
    
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
    if (!siteData.isUserLoggedIn()) {
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
    res.redirect('/urls');
})


app.listen(8080)

console.log('listening on port 8080')