module.exports = function getURLVisits(data, urlID) {
  let urlVisits = {};
  for (let urlIndex in data) {
    if (data[urlIndex].shortURL === urlID) {
      urlVisits[urlIndex] = data[urlIndex];
    }
  }
  return urlVisits;
};



