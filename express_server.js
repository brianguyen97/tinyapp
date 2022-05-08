// Requirements
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

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
  console.log(`Example app listening on port ${PORT}!`);
});

// URL Database
const urlDatabase = {
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'billieEilish',
  },
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
  return Math.random().toString(36).slice(2, 8);
};

// Create a new user
const createNewUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    res.status(400).send('Email and password cannot be empty');
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      hashedPassword,
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

// Verify Password
const verifyPassword = (user, password) =>
  bcrypt.compareSync(password, user.hashedPassword);

// fetch urls by user ID
const urlsForUser = userid => {
  let accumulator = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === userid) {
      accumulator[url] = urlDatabase[url];
    }
  }
  return accumulator;
};

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
  const exists = checkIfUserExists(req.body.email);
  if (exists) {
    res.status(400).send('Email is already in use.');
  } else {
    const newUser = createNewUser(req, res);
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

// login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = checkIfUserExists(email);
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = bcrypt.compareSync(password, hashedPassword);
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
  const userID = req.cookies['user_id'];
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
