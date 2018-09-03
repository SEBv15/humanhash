var hasher = new (require("./index.js"))()

console.log(hasher.humanize("0123456789abcdef"))

console.log(hasher.uuid(8, '*'))