import React from 'react';
import {
  render,
  getQueriesForElement,
  act,
  getAllByTestId,
  RenderOptions,
  ReactTestInstance,
  NativeTestInstance,
  prettyPrint,
  getByHintText,
  queryAllByTestId,
} from '@testing-library/react-native';

import {
  History,
  history as globalHistory,
  iHistoryProvider,
} from 'navigation-components';

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
    ui,

    {
      wrapper: Wrapper as any,
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
  let screens = queryAllByTestId(container, /rnl-screen/i);

  let maxDepth = 0;
  let matchIndex = 0;

  // finds rnl-screen with the highest focus depth in the tree
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    const depth = parseInt(screen.props.testID.replace(/^\D+/g, ''));

    if (depth >= maxDepth) {
      matchIndex = i;
      maxDepth = depth;
    }
  }

  return screens[matchIndex];
}

function _navigate(to: string, history = globalHistory) {
  act(() => {
    history.navigate(to);
  });
}

function cleanupHistory(history = globalHistory) {
  act(() => {
    history.reset();
  });
}

export {
  renderWithHistory as render,
  _navigate as navigate,
  cleanupHistory as cleanup,
  defaults,
  findFocused,
};
