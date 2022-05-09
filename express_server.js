// Requirements
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { urlDatabase, users } = require('./database');
const {
  getUserByEmail,
  generateRandomString,
  createNewUser,
  urlsForUser,
} = require('./helpers');

app.use(
  cookieSession({
    name: 'tinyApp',
    keys: ['key'],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.listen(8080, () => {});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Registration Page
app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  res.render('register', templateVars);
});

// Register Post (Create a new user)
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(req.body.email, users);
  if (!email || !password)
    return res.status(400).send('Email and password cannot be blank!');
  if (user) {
    res.status(400).send('Email is already in use.');
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = createNewUser(email, hashedPassword, users);
    req.session.user_id = newUser.id;
    res.redirect('/urls');
  }
});

// Login page
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  res.render('login', templateVars);
});

// Login post (User login process)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!password || !email)
    return res.status(403).send('Email and Password cannot be blank.');
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send('Invalid login credentials. Please try again.');
    }
  } else {
    res
      .status(403)
      .send(
        'No account has been created with this e-mail. Please register for an account.'
      );
  }
});

// Logout feature
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// URL Index Page
app.get('/urls', (req, res) => {
  const urls = urlsForUser(req.session.user_id);
  const templateVars = {
    urls,
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.status(400).send('Please login or create an account.');
  } else {
    res.render('urls_index', templateVars);
  }
});

// Create a New URL Page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.status(400).send('Please login or create an account.');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL.longURL],
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send('You can only view this URL if you created it!');
  }
});

// Redirect to long URL from shortURL
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send('This URL does not exist!');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// POST request, adds the longURL and shortURL to our database object
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect(`/urls/${shortURL}`);
});

// POST request, deletes longURL and shortURL from our database object
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send('You cannot delete this URL unless you generated it!');
  }
});

// Edit URL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send('You cannot edit this URL unless you generated it!');
  }
});
