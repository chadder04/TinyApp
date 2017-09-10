// Require and Instantiate express
const app = require('express')()

// Local siteData - only persists while app.js is running server. 
const siteData = {
    userLoggedIn: false,
    userSessionData: [],
    userTable: [
        {
            id: 1,
            userLoginName: 'chadder04',
            userFullName: 'Chad Garrett',
            userEmail: 'chadgarrett_@hotmail.com'

        }
    ]
}

// Set the view engine to ejs
app.set('view engine', 'ejs')

// Set home page
app.get('/', (req, res) => {
  // render `home.ejs` with all available siteData
  res.render('home', { siteData: siteData })
})

app.listen(8080)

console.log('listening on port 8080')