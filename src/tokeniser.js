/**
 * A JavaScript implementation of tokeniser.
 * Creates an array of tokens ready for mashing.
 */

var mappings = new Hashtable();
readFile("https://api.trigid.org/assets/csv/mappings.csv", initializeMap);

function tokeniseSingleLine(input) {
    input = normalizeString(input);
    var tokens = tokenise(input);
    return removeDuplicateUsingFilter(tokens);
}

function tokeniseMultipleLines(input) {
    var lines = v.split(input, /[\r\n]+/);
    var tokens = [];
    for (var cursor = 0; cursor < lines.length; cursor++) {
        tokens.push(tokeniseSingleLine(lines[cursor]));
    }
    return removeDuplicateUsingFilter(tokens);
}

function tokeniseFromArray(input) {
    var tokens = [];
    for (var cursor = 0; cursor < lines.length; cursor++) {
        tokens.push(tokeniseSingleLine(lines[cursor]));
    }
    return removeDuplicateUsingFilter(tokens);
}

function tokeniseFromFile(input) {
    var allTextLines = v.split(input, /[\r\n]+/);
    var tokens = [];
    for (var cursor = 0; cursor < allTextLines.length; cursor++) {
        tokens.push(tokeniseSingleLine(allTextLines[cursor]));
    }
    return removeDuplicateUsingFilter(tokens);
}

function readDataFile(path) {
    readFile(path, tokeniseFromFile);
}

function normalizeString(inputStr) {
    if (v.isEmpty(inputStr) || inputStr.length == 0) return null;
    inputStr = v.trim(inputStr);                    // Trim whitespace
    inputStr = v.lowerCase(inputStr);               // Convert to lowercase
    return inputStr;
}

function removeSymbols(inputStr) {
    if (v.isEmpty(inputStr) || inputStr.length == 0) return null;
    // Remove symbols - comma, dot, etc...
    var inputStr = v.replace(inputStr, /[\. \"\'_+=,:-]+/g, '');
    return inputStr;
}

function tokenise(inputStr) {
    if (v.isEmpty(inputStr) || inputStr.length == 0) return null;
    var inputStrArr = v.split(inputStr, ' ');       // String to array
    var tokens = new Array();
    for (var cursor = 0; cursor < inputStrArr.length; cursor++) {
        var token = removeSymbols(inputStrArr[cursor]);
        if (token.length <= 1) continue;            // Exclude single char word
        if (!mappings.containsKey(token) && !mappings.containsValue(token)) {
            if (isProperlyFormedWord(token)) {      // Convert to soundex mash
                tokens[cursor] = convertToSoundexMash(token);
            } else {
                tokens[cursor] = token;
            }
        }
    }
    return tokens;
}

function removeDuplicateUsingFilter(arr){
    var unique_array = arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique_array;
}

function isProperlyFormedWord(inputStr) {
    if (inputStr.length >= 4 && v.isAlpha(inputStr) && countVowel(inputStr) >= 1) {
        return true;
    }
    return false;
}

function convertToSoundexMash(inputStr) {
    // [0] - primary mash, [1] - alternate mash
    return doubleMetaphone(inputStr)[0];
}

function countVowel(inputStr)
{
    var vowelList = 'aeiou';
    var vCount = 0;
    for(var cursor = 0; cursor < inputStr.length; cursor++)
    {
        if (v.indexOf(vowelList, inputStr[cursor]) !== -1) vCount += 1;
    }
    return vCount;
}

function readFile(path, callback) {
    // read text from URL location
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status == 0) {
                callback(request.responseText);
            }  else {
                callback(null);
            }
        }
    }
    request.open('GET', path);
    request.send();
}

function initializeMap(fileData) {
    if (!fileData) return;

    var comments = "//";    // CSV should support C-style comments
    var allTextLines = v.split(fileData, /[\r\n]+/);

    for (var cursor = 0; cursor < allTextLines.length; cursor++) {
        if (v.first(allTextLines[cursor], 2) != comments) {
            var values = v.split(allTextLines[cursor], ',');
            mappings.put(v.trim(values[0], ' '), v.trim(values[1], ' '));
        }
    }
}

function standardizeDate(strInput, locale) {
    var date = v.split(strInput, /[\s/-]+/);
    var day, month, year, formattedDate;

    moment.locale(locale);
    if (date.length == 3 && v.isDigit(date.join(''))) {
        if (getYear(date) == 0) {
            // case where year has 4 digits
            // yyyy/mm/dd, yyyy/dd/mm
            day = getDay(date[1], date[2]);
            month = getMonth(date[1], date[2]);
            year = date[getYear(date)];
        } else if (getYear(date) != -1) {
            // case where year has 4 digits
            // dd/mm/yyyy, yyyy/mm/dd, mm/dd/yyyy
            day = getDay(date[0], date[1]);
            month = getMonth(date[0], date[1]);
            year = date[getYear(date)];
        } else {
            // case where year has 2 digits and is always on the leftmost position
            // dd/mm/yy, mm/dd/yy
            day = getDay(date[0], date[1]);
            month = getMonth(date[0], date[1]);
            year = moment.parseTwoDigitYear(date[2]);
        }
        formattedDate = moment([year, month-1, day]).format("YYYY-MM-DD");
    } else {
        // for other date formats
        var DATE_FORMAT = ['LT', 'LTS', 'L', 'LL', 'LLL', 'LLLL'];
        for (var cursor = 0; cursor < DATE_FORMAT.length; cursor++) {
            if (moment(strInput, DATE_FORMAT[cursor]).format(DATE_FORMAT[cursor]) === strInput) {
                formattedDate = moment(strInput, DATE_FORMAT[cursor]).format("YYYY-MM-DD");
                break;
            }
        }
        if (v.isEmpty(formattedDate) || formattedDate.length == 0) {
            formattedDate = moment(strInput).format("YYYY-MM-DD");
        }
    }
    return formattedDate.toString(locale);
}

function getDay(date1, date2) {
    if (date1 > 12) {
        return date1;
    } else if (date2 > 12) {
        return date2;
    }
    return date2;
}

function getMonth(date1, date2) {
    if (date1 > 12) {
        return date2;
    } else if (date2 > 12) {
        return date1;
    }
    return date1;
}


function getYear(date) {
    var index = -1;
    for (var cursor = 0; cursor < date.length; cursor++) {
        if (date[cursor].length == 4) {
            index = cursor;
            break;
        }
    }
    return index;
}