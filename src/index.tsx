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
  iHistoryProvider,
} from 'react-navigation-library';

interface RenderHistoryProps extends iHistoryProvider {
  noWrap?: boolean;
}
export interface NavigatorRenderOptions extends RenderOptions {
  historyProps?: Partial<RenderHistoryProps>;
}

const defaultProps: NavigatorRenderOptions = {
  options: {},
  historyProps: {},
};

function EmptyWrapper({ children }: any) {
  return children;
}

function renderWithHistory(
  ui: any,
  args: NavigatorRenderOptions = defaultProps
) {
  const { options, historyProps = {}, ...rest } = args;

  const { history = globalHistory, noWrap, ...props } = historyProps;
  const Wrapper = noWrap ? EmptyWrapper : History;

  const utils = render(
    <Wrapper history={history} {...props}>
      {ui}
    </Wrapper>,
    {
      options: {
        debug: {
          omitProps: ['style', 'activeOpacity', 'activeOffsetX', 'testID'],
          ...(options && options.debug ? options.debug : {}),
        },
      },
      ...rest,
    }
  );

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

  function navigate(to: string) {
    _navigate(to, history);
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
    navigate,
  };
}

function _navigate(to: string, history = globalHistory) {
  act(() => {
    history.navigate(to);
  });
}

function cleanupHistory(history = globalHistory) {
  history.reset();
}

export {
  renderWithHistory as render,
  _navigate as navigate,
  cleanupHistory as cleanup,
};
