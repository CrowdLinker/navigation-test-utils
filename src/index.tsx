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
  // TODO -- this needs to be updated as it doesn't descriminate for children with a disabled parent
  // it shouldn't be possible w/ navigation-components for now but it might break in the future
  const screens = getAllByTestId(container, 'rnl-screen', {
    selector: ({ props }) => {
      return (
        props.accessibilityStates &&
        props.accessibilityStates.includes('selected')
      );
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
