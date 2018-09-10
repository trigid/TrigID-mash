/**
 * A JavaScript implementation of Mash algorithm.
 * Generates a mash value for each token.
 */

function mashInput(inputStr) {
    var tokenStr = tokeniseSingleLine(inputStr);
    var mashArr = mashTokens(tokenStr);
    return {"tokenise":JSON.stringify(tokenStr), "mash":JSON.stringify(mashArr)};
}

function mashTokens(inputTokens) {
    var mashArr = new Array();
    for (var i = 0; i < inputTokens.length; i++) {
        mashArr[i] = mash(inputTokens[i]);
    }
    return mashArr;
}

function hashCode(tokenStr){
    if (tokenStr.length == 0 || v.isEmpty(tokenStr)) return 0;

    var hash = 0;
    for (var i = 0; i < tokenStr.length; i++) {
        char = v.codePointAt(tokenStr, i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;                    // Convert to 32bit integer
    }
    return hash;
}

function mash(tokenStr) {
    if (tokenStr.length == 0 || v.isEmpty(tokenStr)) return 0;
    var mashValue = hashCode(tokenStr) << 12 >>> 12;
    return mashValue.toString(36);
}