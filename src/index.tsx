import React from 'react';
import {
  render,
  getQueriesForElement,
  act,
  getAllByTestId,
  RenderOptions,
} from '@testing-library/react-native';

import {
  History,
  history as globalHistory,
  navigate as globalNavigate,
  iHistoryProvider,
} from 'react-navigation-library';

export interface NavigatorRenderOptions extends RenderOptions {
  historyProps?: Partial<iHistoryProvider>;
}

const defaultProps: NavigatorRenderOptions = {
  options: {},
  historyProps: {},
};

function renderWithHistory(
  ui: any,
  args: NavigatorRenderOptions = defaultProps
) {
  const { options, historyProps, ...rest } = args;

  const utils = render(<History {...historyProps}>{ui}</History>, {
    options: {
      debug: {
        omitProps: ['style', 'activeOpacity', 'activeOffsetX', 'testID'],
        ...(options && options.debug ? options.debug : {}),
      },
    },
    ...rest,
  });

  function getFocused() {
    const focusedScreen = findFocused(utils.container);
    return {
      container: focusedScreen,
      ...getQueriesForElement(focusedScreen),
      debug: function() {
        return utils.debug(focusedScreen);
      },
    };
  }

  function findFocused(parent: any): any {
    const focusedScreens = getAllByTestId(parent, 'rnl-screen', {
      selector: ({ props }) =>
        props.accessibilityStates &&
        props.accessibilityStates.includes('selected'),
    });

    if (focusedScreens.length > 1) {
      if (parent === focusedScreens[0]) {
        if (focusedScreens[1]) {
          return findFocused(focusedScreens[1]);
        }
      }

      return findFocused(focusedScreens[0]);
    }

    return focusedScreens[0];
  }

  return {
    ...utils,
    getFocused,
  };
}

function navigate(to: string) {
  act(() => {
    globalNavigate(to);
  });
}

function cleanupHistory() {
  globalHistory.reset();
}

// override render method
export { renderWithHistory as render, navigate, cleanupHistory as cleanup };
