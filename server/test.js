const champions = require('./db.json').champions;

var tagsList = [];

for (var i in champions) {
    var tags = champions[i]?.tags || [];
    for (var j in tags) { 
        if (!tagsList.includes(tags[j])) {
            tagsList.push(tags[j]);
        }   
    }
}
console.log(tagsList);


// partype
// mana, energy, none, other (pode ser qql coisa)