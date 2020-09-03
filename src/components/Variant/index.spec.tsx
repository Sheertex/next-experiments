import React, { FunctionComponent, ReactNode, useContext } from 'react';
// import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import ExperimentContext from '../ExperimentContext';
// import { recordWin } from '../../events';
import Variant from '.';

const makeContextWrapper = (value): FunctionComponent => ({
  children,
}: {
  children?: ReactNode;
}) => (
  <ExperimentContext.Provider value={value}>
    {children}
  </ExperimentContext.Provider>
);

describe('Variant', () => {
  describe('when provided with an invalid `name` prop', () => {
    let consoleSpy;
    const ContextWrapper = makeContextWrapper({ name: 'experiment-foo' });

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('throws an error if the name is undefined', () => {
      const ContextWrapper = makeContextWrapper({ name: 'experiment-foo' });

      expect(() =>
        render(
          <ContextWrapper>
            {/* @ts-ignore */}
            <Variant>Bar!</Variant>
          </ContextWrapper>,
        ),
      ).toThrowError(/Name is undefined/);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('throws an error if the name is invalid', () => {
      expect(() =>
        render(
          <ContextWrapper>
            <Variant name="__!!some_invalidname!!@">Bar!</Variant>
          </ContextWrapper>,
        ),
      ).toThrowError(/__!!some_invalidname!!@" is not valid name/);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });
});
