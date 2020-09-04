import React, { FunctionComponent, ReactNode } from 'react';
import { render } from '@testing-library/react';
import ExperimentContext from '../ExperimentContext';
import Experiment from '../Experiment';
import * as experimentEvents from '../../events';
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

jest.mock('../../events');

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

  describe('when provided with an valid `name` prop', () => {
    describe('if the children prop is a function', () => {
      it('renders the `children` correctly', () => {
        const { getByTestId, getByText } = render(
          <Experiment name="experiment-foo" defaultVariantName="variant-bar">
            <Variant name="variant-bar">
              {(win) => {
                return (
                  <button data-testid="bar" onClick={win}>
                    Bar!
                  </button>
                );
              }}
            </Variant>
          </Experiment>,
        );

        expect(getByTestId('bar')).toBeDefined();
        expect(getByText('Bar!')).toBeDefined();
      });

      it('calls the `recordWin` method properly', () => {
        const { getByTestId } = render(
          <Experiment name="experiment-foo" defaultVariantName="variant-bar">
            <Variant name="variant-bar">
              {(win) => (
                <button data-testid="bar" onClick={win}>
                  Bar!
                </button>
              )}
            </Variant>
          </Experiment>,
        );

        getByTestId('bar').click();
        expect(experimentEvents.recordWin).toHaveBeenCalledWith(
          'experiment-foo',
          'variant-bar',
        );
      });
    });
  });
});
