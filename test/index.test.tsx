import React from 'react';
import { render, navigate, cleanup, findFocused } from '../src';
import { Text, View } from 'react-native';
import {
  Navigator,
  Tabs,
  history,
  createHistory,
  useLocation,
} from 'navigation-components';
import { getByText, act } from '@testing-library/react-native';

let log: any;

function Test() {
  const location = useLocation();
  return (
    <Navigator routes={['1', '2']}>
      <Tabs>
        <Text style={{ fontWeight: 'bold' }}>1</Text>
        <Text>2</Text>
      </Tabs>

      <Text>{location}</Text>
    </Navigator>
  );
}

afterEach(() => {
  log = undefined;
  // @ts-ignore
  // console.log.mockRestore();
});

test('render works', () => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));

  const { getFocused } = render(<Test />);

  getFocused().debug();
  expect(log.includes('style')).toBe(false);

  expect(log).toMatchInlineSnapshot(`
    "[36m<View[39m
      [33maccessibilityRole[39m=[32m\\"tab\\"[39m
      [33maccessibilityStates[39m=[32m{
        Array [
          \\"selected\\",
        ]
      }[39m
      [33mtestID[39m=[32m\\"rnl-screen\\"[39m
    [36m>[39m
      [36m<Text>[39m
        [0m1[0m
      [36m</Text>[39m
    [36m</View>[39m"
  `);

  // @ts-ignore
  console.log.mockRestore();
});

test('render opts can be overridden', () => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));

  const { getFocused } = render(<Test />, {
    options: { debug: { omitProps: ['style'] } },
  });

  getFocused().debug();
  expect(log.includes('testID')).toBe(true);
  expect(log).toMatchInlineSnapshot(`
    "[36m<View[39m
      [33maccessibilityRole[39m=[32m\\"tab\\"[39m
      [33maccessibilityStates[39m=[32m{
        Array [
          \\"selected\\",
        ]
      }[39m
      [33mtestID[39m=[32m\\"rnl-screen\\"[39m
    [36m>[39m
      [36m<Text>[39m
        [0m1[0m
      [36m</Text>[39m
    [36m</View>[39m"
  `);

  // @ts-ignore
  console.log.mockRestore();
});

test('navigate() calls work', () => {
  const spy = jest.spyOn(history, 'navigate');

  const { getFocused } = render(<Test />);

  getFocused().getByText('1');

  navigate('/2');

  expect(spy).toHaveBeenCalled();
  getFocused().getByText('2');
});

test('cleanup() resets the history', () => {
  const spy = jest.spyOn(history, 'reset');

  navigate('/2');
  cleanup();

  expect(spy).toHaveBeenCalled();
  expect(history.location).toEqual('/');
});

test('navigate() can use a specified history', () => {
  const myHistory = createHistory();
  const spy = jest.spyOn(myHistory, 'navigate');

  navigate('/hello-joe', myHistory);

  expect(spy).toHaveBeenCalled();
});

test('cleanup() can use a specified history', () => {
  const myHistory = createHistory();
  const spy = jest.spyOn(myHistory, 'reset');

  cleanup(myHistory);

  expect(spy).toHaveBeenCalled();
});

test('noWrap option does not wrap render() history', () => {
  render(<Text>Hi</Text>, { historyProps: { noWrap: true } });
});

test('findFocused() returns the deepest selected node', () => {
  const { container, rerender } = render(
    <View testID="rnl-screen" accessibilityStates={['selected']}>
      <View testID="rnl-screen" accessibilityStates={['selected']}>
        <View testID="rnl-screen" accessibilityStates={['selected']}>
          <Text testID="rnl-screen" accessibilityStates={['selected']}>
            I am not focused
          </Text>
        </View>
      </View>

      <View testID="rnl-screen" accessibilityStates={['selected']}>
        <Text>I am focused</Text>
      </View>
    </View>
  );

  let focused = findFocused(container);
  getByText(focused, 'I am focused');

  expect(() => getByText(focused, 'I am not focused')).toThrow();

  rerender(
    <View testID="rnl-screen" accessibilityStates={['selected']}>
      <View testID="rnl-screen" accessibilityStates={['selected']}>
        <View testID="rnl-screen" accessibilityStates={['selected']}>
          <Text testID="rnl-screen" accessibilityStates={['selected']}>
            I am now focused
          </Text>
        </View>
      </View>

      <View testID="rnl-screen" accessibilityStates={['disabled']}>
        <Text>I am not focused anymore</Text>
      </View>
    </View>
  );

  focused = findFocused(container);
  getByText(focused, 'I am now focused');
  expect(() => getByText(focused, 'I am not focused anymore')).toThrow();
});
