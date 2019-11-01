const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const bcrypt = require('bcrypt');
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

const urlDatabase = {
  "lksr5j": { longURL: 'http://www.facebook.com', userID: 'h7kv7a' }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b><body></html>\n');
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
    return;
  }
  let user = users[req.session.user_id];
  let userURLs = urlsForUser(user.id, urlDatabase);
  console.log('poop', userURLs);
  let templateVars = { 
    urls: userURLs,
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
   };
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  let templateVars = { 
    user: users[req.session.user_id] };
  res.render('urls_reg', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { 
    user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: longURL, userID: req.session.user_id };
  console.log(urlDatabase); // Log the POST requst body to the console
  res.redirect(`/urls/${randomString}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL: req.body.updatedURL, userID: req.session.user_id};
  res.redirect(`/urls/${req.params.shortURL}`)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // for (const userID in users) {
    const user = getUserByEmail(email, users);
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect(`/urls`);
      } 
    } 
  // }
  res.send("403");
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
})

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.send("400 Bad Request");
  }
  let hashedPassword = bcrypt.hashSync(password, 10);
  // for (const userID in users) {
  user = getUserByEmail(email, users);
  console.log('dtfygubhijkmjhugytf', user);
  if (user) {
    return res.send("400 Bad Request");
  }
  // }
  users[userID] = { id: userID, email: email, password: hashedPassword};
  console.log(users);
  req.session.user_id = userID;
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})