function generateRandomString() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;
}

const getUserByEmail = function(email, users) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
};

function urlsForUser(id, urlDatabase) {
  let userUrls = {};
  console.log('dino', id)
  for (let key in urlDatabase) {
    let urlRecord = urlDatabase[key];
    if (id === urlRecord.userID) {
      userUrls[key] = urlRecord;
    }
  }
  return userUrls;
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};