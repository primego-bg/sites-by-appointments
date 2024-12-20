function validateName(name) {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(name);
}

module.exports = validateName;