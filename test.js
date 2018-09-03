var HumanHasher = require("./index.js")

var hasher = new HumanHasher()

console.log(hasher.humanize("0123456789abcdef"))

console.log(hasher.uuid(8, '*'))