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
  // TODO -- this needs to be updated as it doesn't descriminate for children with a disabled parent
  // it shouldn't be possible w/ navigation-components for now but it might break in the future
  let screens = getScreens(container);

  if (screens.length === 0) {
    return container;
  }

  // find subscreen with the fewest amount of child screens
  let matchIndex = 0;
  let minDepth = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < screens.length; i++) {
    const subscreens = queryAllByTestId(screens[i], 'rnl-screen');
    const depth = subscreens.length;

    if (depth <= minDepth) {
      minDepth = depth;
      matchIndex = i;
    }
  }

  return screens[matchIndex];
}

// findAll() walks the tree in order, not via node heirarchy
// that means that selected screens that are children of disabled screens are tough to filter out
// otherwise some kind of recursive function could walk the tree
function getScreens(container: NativeTestInstance) {
  let screens = queryAllByTestId(container, 'rnl-screen', {
    selector: ({ props }) =>
      props.accessibilityStates &&
      props.accessibilityStates.includes('selected'),
  });

  if (screens.length > 1) {
    // screens[0] is the container itself
    const disabledScreens = queryAllByTestId(screens[1], 'rnl-screen', {
      selector: ({ props }) =>
        props.accessibilityStates &&
        props.accessibilityStates.includes('disabled'),
    });

    // remove any descendent nodes that are selected, but are the child of a disabled screen
    if (disabledScreens.length > 0) {
      disabledScreens.forEach(disabledContainer => {
        const childNodes = getScreens(disabledContainer).map(s => s._fiber);
        screens = screens.filter(node => !childNodes.includes(node._fiber));
      });
    }
  }

  return screens;
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
