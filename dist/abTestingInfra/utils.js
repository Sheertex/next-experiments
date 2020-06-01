"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidName = exports.assertNameIsValid = exports.AB_TEST_PAYLOAD_PREFIX = exports.AB_TEST_PAYLOAD_KEY = void 0;
const AB_TEST_PAYLOAD_PREFIX = '--ab--';
exports.AB_TEST_PAYLOAD_PREFIX = AB_TEST_PAYLOAD_PREFIX;
const AB_TEST_PAYLOAD_KEY = 'AB_TESTING_PAYLOAD';
exports.AB_TEST_PAYLOAD_KEY = AB_TEST_PAYLOAD_KEY;
function isValidName(name) {
    if (!name) {
        return false;
    }
    //Name should contain only a-z 0-9 and dash as it will be passed in the url
    return /^[a-z0-9-]+$/.test(name);
}
exports.isValidName = isValidName;
function assertNameIsValid(name) {
    if (!name) {
        throw new Error('Name is undefined');
    }
    if (!isValidName(name)) {
        throw new Error(`"${name}" is not valid name. Use only lowercase latin symbols, digits and dash`);
    }
    return;
}
exports.assertNameIsValid = assertNameIsValid;
//# sourceMappingURL=utils.js.map