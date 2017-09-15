module.exports = function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
};