import React from 'react';
import {
  render,
  getQueriesForElement,
  act,
  getAllByTestId,
  RenderOptions,
  ReactTestInstance,
  NativeTestInstance,
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

const defaults = {
  omitProps: [
    'style',
    'activeOpacity',
    'activeOffsetX',
    'pointerEvents',
    'collapsable',
    'underlineColorAndroid',
    'rejectResponderTermination',
    'allowFontScaling',
  ],
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
          omitProps: defaults.omitProps,
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

  return {
    ...utils,
    getFocused,
    navigate,
  };
}

function findFocused(container: NativeTestInstance): NativeTestInstance {
  const screens = getAllByTestId(container, 'rnl-screen', {
    selector: ({ props, parent }) => {
      const parentFocused =
        parent.props.accessibilityStates &&
        parent.props.accessibilityStates.includes('selected');

      const childFocused =
        props.accessibilityStates &&
        props.accessibilityStates.includes('selected');

      return parentFocused && childFocused;
    },
  });

  return screens[screens.length - 1];
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
  defaults,
  findFocused,
};
