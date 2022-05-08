const { assert } = require('chai');

const {
  getUserByEmail,
  createNewUser,
  generateRandomString,
} = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.deepEqual(user.id, expectedUserID);
  });
  it('should return false for a user with an invalid email', () => {
    const user = getUserByEmail('ilomilo@gmail.com', testUsers);
    const expectedUserID = false;
    assert.deepEqual(user, expectedUserID);
  });
});

describe('createNewUser', () => {
  it('return true if new user was created successfully', () => {
    const user = createNewUser('blohsh@gmail.com', 'billie', testUsers);
    assert.equal(user.id, testUsers[user.id].id);
  });
});

describe('generateRandomString', () => {
  it('strings should be unique, and not be equal', () => {
    const string0 = generateRandomString();
    const string1 = generateRandomString();
    assert.notEqual(string0, string1);
  });
});
