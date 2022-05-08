// Generate and returns a random string. Used for URLs and User IDS. No parameters needed to be passed in.
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// Adds a new user to a database. Pass in user e-mail, hashedPassword and which database.
const createNewUser = (email, hashedPassword, database) => {
  const id = generateRandomString();
  database[id] = {
    id,
    email,
    hashedPassword,
  };
  return database[id];
};

/* Checks if email is already in use in an existing database.  
Pass in email and database as parameters. Returns user if existing, false if not.
*/
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return database[user];
  }
  return false;
};

// Retrieves urls by passing in the user's ID as a parameter. Returns an object with their corresponding urls.
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
  getUserByEmail,
  generateRandomString,
  createNewUser,
  urlsForUser,
};
