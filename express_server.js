const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

function urlsForUser(id) {
  // for (let key in urlDatabase) {
  //   if (id === urlDatabase[req.params.shortURL].userID) {
  //     return { }
  // }
}

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
  let user = users[req.cookies['userID']];
  let userURLs = urlsForUser(user);
  console.log(user);
  let templateVars = { 
    urls: userURLs,
    user: users[req.cookies['userID']]
   };
   const userID = req.cookies.userID;
  if (!userID) {
    res.redirect('/login');
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.cookies['userID']]
   };
  const userID = req.cookies.userID;
  if (!userID) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['userID']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  let templateVars = { 
    user: users[req.cookies['userID']] };
  res.render('urls_reg', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { 
    user: users[req.cookies['userID']] };
  res.render('urls_login', templateVars);
});

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = { longURL: longURL, userID: req.cookies['userID'] };
  console.log(urlDatabase); // Log the POST requst body to the console
  res.redirect(`/urls/${randomString}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL: req.body.updatedURL, userID: req.cookies['userID']};
  res.redirect(`/urls/${req.params.shortURL}`)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  for (const userID in users) {
    user = users[userID];
    if (user.email === email) {
      if (user.password === password) {
        res.cookie('userID', userID);
        res.redirect(`/urls`);
      } 
    } 
  }
  res.send("403");
})

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect(`/urls`);
})

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.send("400 Bad Request");
  }
  for (const userID in users) {
    user = users[userID];
    if (user.email === email) {
      res.send("400 Bad Request");
    }
  }
  users[userID] = { id: userID };
  users[userID]['email'] = email;
  users[userID]['password'] = hashedPassword;
  console.log(users);
  res.cookie('userID', userID);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})