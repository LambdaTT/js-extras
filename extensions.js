/////////////////////
// STRING EXTENSIONS:
/////////////////////
String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

String.prototype.ucFirst = function () {
  var target = this;
  return target.charAt(0).toUpperCase() + target.substring(1);
};

String.prototype.toCamelCase = function (separator) {
  var tmpArray = this.split(separator);
  for (var i = 0; i < tmpArray.length; i++) {
    if (i == 0)
      continue;

    let word = tmpArray[i];

    tmpArray[i] = word.ucFirst();
  }

  return tmpArray.join("");
};

String.prototype.fromCamelCase = function (separator) {
  $input = this;
  $result = "";
  for (let i = 0; i < $input.length; i++) {
    if ($input.charAt(i) == $input.charAt(i).toUpperCase()) {
      $result += separator + $input.charAt(i).toLowerCase();
    } else $result += $input.charAt(i).toLowerCase();
  }

  return $result;
};

String.prototype.toSlug = function stringToSlug() {
  var str = this;
  /* info: https://gist.github.com/codeguy/6684588 */
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();
  // remove accents, swap ñ for n, etc
  var from = "åàáãäâèéëêìíïîòóöõôùúüûñç·/_,:;";
  var to = "aaaaaaeeeeiiiiooooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-+/, "") // trim - from start of text
    .replace(/-+$/, ""); // trim - from end of text
  return str;
}

String.prototype.insertCharsAt = function (chars, position) {
  var str = this;
  return str.slice(0, position ?? 0) + (chars ?? '') + str.slice(position ?? 0);
};

/////////////////////
// OBJECT EXTENSIONS:
/////////////////////
Object.prototype.size = function () {
  return Object.keys(this).length;
};

Object.prototype.map = function (callback) {
  var obj = this;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => callback(key, value))
  );
};

Object.prototype.clone = function () {
  return { ...this };
};

Object.prototype.toSerialString = function (skipKeys, joint) {
  var obj = this;
  if (obj.size() == 0) return '';

  skipKeys = skipKeys ?? [];

  return Object.keys(obj).map(function (key) {
    if (skipKeys.indexOf(key) > -1)
      return '';

    return `${key}=${obj[key]}`;
  }).join(joint ?? '&');
};

// NUMBER EXTENSIONS:
Number.prototype.number_format = function (decimals, decPoint, thousandsSep) {
  // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/number_format/
  // original by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: davook
  // improved by: Brett Zamir (https://brett-zamir.me)
  // improved by: Brett Zamir (https://brett-zamir.me)
  // improved by: Theriault (https://github.com/Theriault)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Gabriel Valentoni (https://github.com/gabriel-guelfi)
  // bugfixed by: Michael White (https://getsprink.com)
  // bugfixed by: Benjamin Lupton
  // bugfixed by: Allan Jensen (https://www.winternet.no)
  // bugfixed by: Howard Yeend
  // bugfixed by: Diogo Resende
  // bugfixed by: Rival
  // bugfixed by: Brett Zamir (https://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  //  revised by: Luke Smith (https://lucassmith.name)
  //    input by: Kheang Hok Chin (https://www.distantia.ca/)
  //    input by: Jay Klehr
  //    input by: Amir Habibi (https://www.residence-mixte.com/)
  //    input by: Amirouche
  //   example 1: number_format(1234.56)
  //   returns 1: '1,235'
  //   example 2: number_format(1234.56, 2, ',', ' ')
  //   returns 2: '1 234,56'
  //   example 3: number_format(1234.5678, 2, '.', '')
  //   returns 3: '1234.57'
  //   example 4: number_format(67, 2, ',', '.')
  //   returns 4: '67,00'
  //   example 5: number_format(1000)
  //   returns 5: '1,000'
  //   example 6: number_format(67.311, 2)
  //   returns 6: '67.31'
  //   example 7: number_format(1000.55, 1)
  //   returns 7: '1,000.6'
  //   example 8: number_format(67000, 5, ',', '.')
  //   returns 8: '67.000,00000'
  //   example 9: number_format(0.9, 0)
  //   returns 9: '1'
  //  example 10: number_format('1.20', 2)
  //  returns 10: '1.20'
  //  example 11: number_format('1.20', 4)
  //  returns 11: '1.2000'
  //  example 12: number_format('1.2000', 3)
  //  returns 12: '1.200'
  //  example 13: number_format('1 000,50', 2, '.', ' ')
  //  returns 13: '100 050.00'
  //  example 14: number_format(1e-8, 8, '.', '')
  //  returns 14: '0.00000001'

  var number = this;

  number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
  var s = ''

  var toFixedFix = function (n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      var arr = ('' + n).split('e')
      var sig = ''
      if (+arr[1] + prec > 0) {
        sig = '+'
      }
      return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
    }
  }

  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }

  return s.join(dec)
};

// ARRAY EXTENSIONS:
Array.prototype.removeDuplicates = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

Array.prototype.intersection = function (array2) {
  return this.filter(itm => array2.includes(itm));
};

Array.prototype.diff = function (array2) {
  return this.filter(itm => !array2.includes(itm)).concat(array2.filter(itm => !this.includes(itm)));
};

Array.prototype.toSerialString = function (name, joint) {
  var data = this;

  if (!name) throw 'You must provide a name for the serialized array.';
  if (data.length == 0) return '';

  return data.map(item => `${name}[]=${item}`).join(joint ?? '&');
};