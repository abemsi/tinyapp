// Returns a string of 6 random alphanumeric characters for a unique shortURL
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;
};

// Look up users by their email from the users database
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
};

// Returns the URLs where the userID is equal to the id of the currently logged in user
const urlsForUser = function(id, urlDatabase) {
  let userUrls = {};
  for (let url in urlDatabase) {
    let urlRecord = urlDatabase[key];
    if (id === urlRecord.userID) {
      userUrls[url] = urlRecord;
    }
  }
  return userUrls;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};