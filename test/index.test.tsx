import React from 'react';
import { render, navigate, cleanup, findFocused } from '../src';
import { Text, View } from 'react-native';
import { Navigator, Tabs, history, createHistory } from 'navigation-components';
import { getByText } from '@testing-library/react-native';

let log: any;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));
});

function Test() {
  return (
    <Navigator routes={['1', '2']}>
      <Tabs>
        <Text style={{ fontWeight: 'bold' }}>1</Text>
        <Text>2</Text>
      </Tabs>
    </Navigator>
  );
}

afterEach(() => {
  log = undefined;
  // @ts-ignore
  console.log.mockRestore();
});

test('render works', () => {
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
});

test('render opts can be overridden', () => {
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

  const { getFocused, rerender } = render(<Test />);

  navigate('/2');
  cleanup();

  rerender(<Test />);

  expect(spy).toHaveBeenCalled();
  getFocused().getByText('1');
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
      <View testID="rnl-screen" accessibilityStates={['disabled']}>
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
