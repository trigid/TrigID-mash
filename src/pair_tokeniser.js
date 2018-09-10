/**
 * Generates a pair (MASH, HASH) for each token.
 * This pair will prove that the data being entered is unique and new for an Identity.
 * 20-bit MASH
 * 32-bit HASH - Fowler–Noll–Vo Hash
 */

var SALT;

function getPairMash(inputStr, salt) {
    SALT = salt;
    var tokenStr = tokeniseSingleLine(inputStr);
    var mashArr = mashTokens(tokenStr);
    var hashArr = hashTokens(tokenStr, salt);
    return {"result":JSON.stringify(generateJSON(mashArr, hashArr))};
}

function hashTokens(inputTokens) {
    var hashArr = new Array();
    for (var i = 0; i < inputTokens.length; i++) {
        hashArr[i] = fnv32a(inputTokens[i]);
    }
    return hashArr;
}

function fnv32a(str) {
	var FNV1_32A_INIT = 0x811c9dc5;
	var hval = FNV1_32A_INIT;
	str = str + SALT;
	for ( var i = 0; i < str.length; ++i )
	{
		hval ^= str.charCodeAt(i);
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	return (hval >>> 0).toString(36);
}

function generateJSON(mashArr, hashArr) {
    if (mashArr.length != hashArr.length) return;

    var pairJSON = {
        count: mashArr.length,
        pair: []
    };

    var cursor = 0;
    for (var cursor = 0; cursor < mashArr.length; cursor++)
       pairJSON.pair.push({
            "mash" : mashArr[cursor],
            "hash" : hashArr[cursor]
        });
    return pairJSON;
}