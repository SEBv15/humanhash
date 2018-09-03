/**
 * humanhash: Human-readable representations of digests.
 */

var uuidv1 = require("uuid/v1")
var uuidv4 = require("uuid/v4")

var DEFAULT_WORDLIST = [
    'ack', 'alabama', 'alanine', 'alaska', 'alpha', 'angel', 'apart', 'april',
    'arizona', 'arkansas', 'artist', 'asparagus', 'aspen', 'august', 'autumn',
    'avocado', 'bacon', 'bakerloo', 'batman', 'beer', 'berlin', 'beryllium',
    'black', 'blossom', 'blue', 'bluebird', 'bravo', 'bulldog', 'burger',
    'butter', 'california', 'carbon', 'cardinal', 'carolina', 'carpet', 'cat',
    'ceiling', 'charlie', 'chicken', 'coffee', 'cola', 'cold', 'colorado',
    'comet', 'connecticut', 'crazy', 'cup', 'dakota', 'december', 'delaware',
    'delta', 'diet', 'don', 'double', 'early', 'earth', 'east', 'echo',
    'edward', 'eight', 'eighteen', 'eleven', 'emma', 'enemy', 'equal',
    'failed', 'fanta', 'fifteen', 'fillet', 'finch', 'fish', 'five', 'fix',
    'floor', 'florida', 'football', 'four', 'fourteen', 'foxtrot', 'freddie',
    'friend', 'fruit', 'gee', 'georgia', 'glucose', 'golf', 'green', 'grey',
    'hamper', 'happy', 'harry', 'hawaii', 'helium', 'high', 'hot', 'hotel',
    'hydrogen', 'idaho', 'illinois', 'india', 'indigo', 'ink', 'iowa',
    'island', 'item', 'jersey', 'jig', 'johnny', 'juliet', 'july', 'jupiter',
    'kansas', 'kentucky', 'kilo', 'king', 'kitten', 'lactose', 'lake', 'lamp',
    'lemon', 'leopard', 'lima', 'lion', 'lithium', 'london', 'louisiana',
    'low', 'magazine', 'magnesium', 'maine', 'mango', 'march', 'mars',
    'maryland', 'massachusetts', 'may', 'mexico', 'michigan', 'mike',
    'minnesota', 'mirror', 'mississippi', 'missouri', 'mobile', 'mockingbird',
    'monkey', 'montana', 'moon', 'mountain', 'muppet', 'music', 'nebraska',
    'neptune', 'network', 'nevada', 'nine', 'nineteen', 'nitrogen', 'north',
    'november', 'nuts', 'october', 'ohio', 'oklahoma', 'one', 'orange',
    'oranges', 'oregon', 'oscar', 'oven', 'oxygen', 'papa', 'paris', 'pasta',
    'pennsylvania', 'pip', 'pizza', 'pluto', 'potato', 'princess', 'purple',
    'quebec', 'queen', 'quiet', 'red', 'river', 'robert', 'robin', 'romeo',
    'rugby', 'sad', 'salami', 'saturn', 'september', 'seven', 'seventeen',
    'shade', 'sierra', 'single', 'sink', 'six', 'sixteen', 'skylark', 'snake',
    'social', 'sodium', 'solar', 'south', 'spaghetti', 'speaker', 'spring',
    'stairway', 'steak', 'stream', 'summer', 'sweet', 'table', 'tango', 'ten',
    'tennessee', 'tennis', 'texas', 'thirteen', 'three', 'timing', 'triple',
    'twelve', 'twenty', 'two', 'uncle', 'undress', 'uniform', 'uranus', 'utah',
    'vegan', 'venus', 'vermont', 'victor', 'video', 'violet', 'virginia',
    'washington', 'west', 'whiskey', 'white', 'william', 'winner', 'winter',
    'wisconsin', 'wolfram', 'wyoming', 'xray', 'yankee', 'yellow', 'zebra',
    'zulu']


class HumanHasher {
    /**
     * Transforms hex digests to human-readable strings.
     *
     * The format of these strings will look something like:
     * `victor-bacon-zulu-lima`. The output is obtained by compressing the input
     * digest to a fixed number of bytes, then mapping those bytes to one of 256
     * words. A default wordlist is provided, but you can override this if you
     * prefer.
     * As long as you use the same wordlist, the output will be consistent (i.e.
     * the same digest will always render the same representation).
     * 
     * @param {Array} wordlist A list of exactly 256 words to choose from
     */
    constructor(wordlist = DEFAULT_WORDLIST) {
        if(wordlist.length !== 256) throw new Error("Wordlist must have exactly 256 items")
        this.wordlist = wordlist
    }

    /**
     * Humanize a given hexadecimal digest.
     * 
     * Change the number of words output by specifying `words`. Change the
     * word separator with `separator`.
     * 
     * @param {String} hexdigest A string of hexadecimal characters to humanize
     * @param {Number} words How many words to output (more = safer)
     * @param {String} separator The string used to seperate the words
     */
    humanize(hexdigest, words = 4, separator = '-') {
        var pairs = hexdigest.match(/(..?)/g)
        var bytes = pairs.map((x) => parseInt(x, 16))
        
        var compressed = this._compress(bytes, words)

        return compressed.map((x) => this.wordlist[x]).join(separator)
    }

    /**
     * Generate a UUID with a human-readable representation.
     * 
     * @param words How many words to output (more = safer)
     * @param seperator The string used to seperate the words
     * @param {Number} version What uuid version to use. 4 = random, 1 = timestamp based (not secure but guaranteed uniqueness)
     */
    uuid(words = 4, seperator = '-', version = 4) {
        var uuid = ((version == 4) ? uuidv4() : uuidv1()).replace(new RegExp("-", 'g'), "")
        return {humanhash: this.humanize(uuid, words, seperator), uuid: uuid}
    }

    /**
     * Compress a list of byte values to a fixed target length.
     * 
     * @param {Array} bytes A list of bytes (numbers from 0-254)
     * @param {Number} target The number of bytes to return / compress to
     */
    _compress(bytes, target) {
        var length = bytes.length
        if(target > length) throw new Error("Fewer input bytes than requested output")

        // Calculate the segment size (divide and round down)
        var seg_size = length/target>>0

        // Split 'bytes' array into 'target' number of segments.
        var segments = []
        for(let i = 0; i<seg_size*target; i+= seg_size) {
            segments.push(bytes.slice(i, i+seg_size))
        }

        // Catch any left-over bytes in the last segment.
        segments[segments.length - 1] = segments[segments.length - 1].concat(bytes.slice(target*seg_size))

        var checksums = segments.map((x) => x.reduce((acc, curr) => acc ^ curr))
        return checksums
    }
}

module.exports = HumanHasher