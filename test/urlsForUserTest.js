const { assert } = require('chai');
const { urlsForUser } = require('../helpers.js');

const urlDatabase = {
  "lksr5j": { longURL: 'http://www.facebook.com', userID: 'userRandomID' }
};

describe('urlsForUser', function() {
  it('should return user specific URLs', function() {
    const userURLs = urlsForUser('userRandomID', urlDatabase);
    const expectedOutput = "lksr5j";
    const firstKey = Object.keys(userURLs)[0];
    assert.equal(expectedOutput, firstKey);
  });

  it('should return undfined with an invalid userID', function() {
    const userURLs = urlsForUser('', urlDatabase);
    const expectedOutput = undefined;
    const firstKey = Object.keys(userURLs)[0];
    assert.equal(expectedOutput, firstKey);
  });
});