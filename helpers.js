// Generate random string for urls and user ids
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// Create a new user
const createNewUser = (email, hashedPassword, database) => {
  const id = generateRandomString();
  database[id] = {
    id,
    email,
    hashedPassword,
  };
  return database[id];
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

module.exports = {
  getUserByEmail,
  generateRandomString,
  createNewUser,
  urlsForUser,
  urlDatabase,
  users,
};
