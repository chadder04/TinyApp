module.exports = function getUserURLs(data, userID) {
    let userURLsObject = {};
    for (let urlIndex in data) {
        if (data[urlIndex].ownerID === userID) {
            userURLsObject[urlIndex] = data[urlIndex];
        }
    }
    return userURLsObject;
}