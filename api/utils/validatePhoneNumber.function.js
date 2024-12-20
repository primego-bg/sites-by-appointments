function validatePhoneNumber(phoneNumber) {
    const regex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    return regex.test(phoneNumber);
}

module.exports = validatePhoneNumber;