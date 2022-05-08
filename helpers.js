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
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
};

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

module.exports = {
  urlDatabase,
  getUserByEmail,
  generateRandomString,
  createNewUser,
  urlsForUser,
};
