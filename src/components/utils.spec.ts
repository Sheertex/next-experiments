import { isValidName } from './utils';

describe('abTestingInfra/utils', function () {
  describe('#isValidName', function () {
    describe('when name is valid', function () {
      it('it returns true', function () {
        expect(isValidName('valid-name')).toBe(true);
        expect(isValidName('valid-name-too')).toBe(true);
        expect(isValidName('valid-123123-name-too')).toBe(true);
        expect(isValidName('123123123213')).toBe(true);
        expect(isValidName('test-123213')).toBe(true);
      });
    });

    describe('when name is invalid', function () {
      it('it returns false', function () {
        expect(!isValidName('#invalid-name')).toBe(true);
        expect(!isValidName('@invalid-name')).toBe(true);
        expect(!isValidName('invalid-%name')).toBe(true);
        expect(!isValidName('invalid-$name')).toBe(true);
        expect(!isValidName('invalid-name^^')).toBe(true);
        expect(!isValidName('inVAlid-name')).toBe(true);
      });
    });
  });
});
