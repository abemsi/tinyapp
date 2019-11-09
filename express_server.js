const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  // Example of database layout
  // "lksr5j": { longURL: 'http://www.facebook.com', userID: 'h7kv7a' }
};

const users = {
  // Example of users database
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});


// GET/POST Routes for registering
app.get('/register', (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
    return;
  }
  let templateVars = {
    user: users[req.session.user_id] };
  res.render('urls_reg', templateVars);
});

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("All fields required");
  }
  let hashedPassword = bcrypt.hashSync(password, 10);
  let user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already exists.");
  }
  users[userID] = { id: userID, email: email, password: hashedPassword};
  req.session.user_id = userID;
  res.redirect('/urls');
});


// GET/POST routes to login
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect(`/urls`);
      return;
    }
  }
  res.status(401).send("Not a valid login");
});


// GET/POST routes for logged in users that displays the index with their URLs
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  let user = users[req.session.user_id];
  let userURLs = urlsForUser(user.id, urlDatabase);
  let templateVars = {
    urls: userURLs,
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: longURL, userID: req.session.user_id };
  res.redirect(`/urls/${randomString}`);
});


// GET route for logged in users to enter a longURL to be shortened
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});


// POST route that allows users to delete their shortURLs
app.post('/urls/:shortURL/delete', (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Not a valid url.");
    return;
  } 
  if (longURL.userID !== userID) {
    res.status(403).send("Not your url.");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


// GET/POST routes for a logged in user to view/edit their newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Not a valid url.");
    return;
  } 
  if (longURL.userID !== userID) {
    res.status(403).send("Not your url.");
    return;
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Not a valid url.");
    return;
  } 
  if (longURL.userID !== userID) {
    res.status(403).send("Not your url.");
    return;
  }
  urlDatabase[req.params.shortURL] = {longURL: req.body.updatedURL, userID: req.session.user_id};
  res.redirect(`/urls`);
});


// GET route that takes you to the longURL site after clicking the short URL
app.get("/u/:shortURL", (req, res) => {
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  const urlObj = urlDatabase[req.params.shortURL];
  if (!urlObj) {
    res.status(404).send("Not a valid url.");
    return;
  }
  if (urlObj.longURL.startsWith('http')) {
    res.redirect(urlObj.longURL);
  } else {
    res.redirect(`http://${urlObj.longURL}`);
  }
});


// POST route to logout and clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});