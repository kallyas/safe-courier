const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    return value;
  };
  
  const password = (value, helpers) => {
    if (value.length < 8) {
      return helpers.message("password must be at least 8 characters");
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return helpers.message("password must contain at least 1 letter and 1 number");
    }
    return value;
  };
  
  const phoneNumber = (value, helpers) => {
    // MTN numbers start with thw following prefixes
    // 078, 077, 076
    // Airtel numbers start with the following prefixes
    // 070, 075
    // All max length is 10
    if (!value.match(/^(0[78]|0[70]|0[75])[0-9]{7}$/)) {
      return helpers.message("phone number must be a valid MTN or Airtel number");
    }
    return value;
  
  }
  
  
  
  export { objectId, password, phoneNumber };