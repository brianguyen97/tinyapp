// Requirements
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {
  getUserByEmail,
  generateRandomString,
  createNewUser,
  urlsForUser,
  urlDatabase,
  users,
} = require('./helpers');

app.use(
  cookieSession({
    name: 'tinyApp',
    keys: ['key'],
  })
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.listen(8080, () => {
  console.log('Listening on Port 8080!');
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

// register page
app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  res.render('register', templateVars);
});

// register post
app.post('/register', (req, res) => {
  const exists = getUserByEmail(req.body.email, users);
  if (exists) {
    res.status(400).send('Email is already in use.');
  } else {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = createNewUser(email, hashedPassword, users);
    req.session.user_id = newUser.id;
    res.redirect('/urls');
  }
});

// login page
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    user: users[req.session.user_id],
  };
  res.render('login', templateVars);
});

// login post
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = bcrypt.compareSync(password, hashedPassword);
  if (!password || !email)
    res.status(403).send('Email and Password cannot be blank.');
  if (user) {
    if (result) {
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

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// urls page
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

// create new url
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
  console.log(urlDatabase);
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
