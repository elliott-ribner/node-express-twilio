module.exports = {
  validResponseType(actual, expected) { //actual is input body from user, expected is the type (String, Number etc)
    switch(expected) {
      case 'String':
        return true
        break;
      case 'Number':
        var reg = /^\d+$/;
        return reg.test(actual);
        break;
    }
  },
  correctResponse(expected) {
    switch(expected) {
      case 'String': 
        return 'Please respond with text.';
        break;
      case 'Number':
        return 'Please respond with a number (i.e. 12 not twelve)';
        break;
    }
  }
}