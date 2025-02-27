const topicToCategory = require('../data/topicToCategory');


function getCategoryForTopic(topic) {
  return topicToCategory[topic] || "Unknown Category";
}


module.exports = {
  getCategoryForTopic
};