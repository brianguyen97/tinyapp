// Requirements
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// URL Database
const urlDatabase = {
  b2xVn2: 'https://www.billieeilish.com',
  '9sm5xK': 'http://www.google.ca',
};

// Users Database
const users = {
  billieEilish: {
    id: 'billieEilish',
    email: 'billieEilish@gmail.com',
    password: 'blohsh',
  },
};

// Helper Functions

// Generate random string for urls and user ids
const generateRandomString = () => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let accumulator = '';
  for (let i = 0; i < 6; i++) {
    accumulator += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return accumulator;
};

// Create a new user
const createNewUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Email and password cannot be empty');
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      password,
    };
    return users[id];
  }
};

// Check If User Exists
const checkIfUserExists = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

// Check if password is correct
const verifyPassword = (user, password) => {
  if (user.password === password) return true;
  return false;
};

// Homepage
app.get('/', (req, res) => {
  res.send('Hello!');
});

// register page
app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']],
  };
  res.render('register', templateVars);
});

// register post
app.post('/register', (req, res) => {
  const exists = checkIfUserExists(req.body.email);
  if (exists) {
    res.status(400).send('Email is already in use.');
  } else {
    const newUser = createNewUser(req, res);
    res.cookie('user_id', newUser.id);
    console.log(users);
    res.redirect('/urls');
  }
});

// login
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = checkIfUserExists(email);
  const verifyPw = verifyPassword(user, password);
  if (user) {
    if (verifyPw) {
      res.cookie('user_id', user.id);
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
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies['user_id'],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST request, adds the longURL and shortURL to our database object
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST request, deletes longURL and shortURL from our database object
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// takes user to longURL when visiting shortURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// TEST
