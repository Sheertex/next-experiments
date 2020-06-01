declare const AB_TEST_PAYLOAD_PREFIX = "--ab--";
declare const AB_TEST_PAYLOAD_KEY = "AB_TESTING_PAYLOAD";
declare function isValidName(name: string): boolean;
declare function assertNameIsValid(name: string): void;
export { AB_TEST_PAYLOAD_KEY, AB_TEST_PAYLOAD_PREFIX, assertNameIsValid, isValidName, };
