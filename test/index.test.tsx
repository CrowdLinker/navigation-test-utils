import React from 'react';
import { render, navigate, cleanup, findFocused, fireEvent } from '../src';
import { Text, View } from 'react-native';
import { history, createHistory } from 'navigation-components';
import {
  getByText,
  act,
  render as RNTLRender,
} from '@testing-library/react-native';

let log: any;

function Test() {
  return (
    <View
      testID="rnl-screen-2"
      accessibilityStates={['selected']}
      style={{ flex: 1 }}
    >
      <Text testID="rnl-screen" accessibilityStates={['disabled']}>
        I am not focused
      </Text>
    </View>
  );
}

afterEach(() => {
  log = undefined;
  // @ts-ignore
  // console.log.mockRestore();
});

test('render works', () => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));

  const { debug } = render(<Test />);

  debug();
  expect(log.includes('style')).toBe(false);

  expect(log).toMatchInlineSnapshot(`
    "[36m<View>[39m
      [36m<View>[39m
        [36m<View[39m
          [33maccessibilityRole[39m=[32m\\"tab\\"[39m
          [33maccessibilityStates[39m=[32m{
            Array [
              \\"selected\\",
            ]
          }[39m
          [33mtestID[39m=[32m\\"rnl-screen\\"[39m
        [36m>[39m
          [36m<View[39m
            [33maccessibilityStates[39m=[32m{
              Array [
                \\"selected\\",
              ]
            }[39m
            [33mtestID[39m=[32m\\"rnl-screen-2\\"[39m
          [36m>[39m
            [36m<Text[39m
              [33maccessibilityStates[39m=[32m{
                Array [
                  \\"disabled\\",
                ]
              }[39m
              [33mtestID[39m=[32m\\"rnl-screen\\"[39m
            [36m>[39m
              [0mI am not focused[0m
            [36m</Text>[39m
          [36m</View>[39m
        [36m</View>[39m
      [36m</View>[39m
    [36m</View>[39m"
  `);

  // @ts-ignore
  console.log.mockRestore();
});

test('render opts can be overridden', () => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));

  const { debug } = render(<Test />, {
    options: { debug: { omitProps: ['style'] } },
  });

  debug();
  expect(log.includes('testID')).toBe(true);
  expect(log).toMatchInlineSnapshot(`
    "[36m<View[39m
      [33mpointerEvents[39m=[32m\\"box-none\\"[39m
    [36m>[39m
      [36m<View[39m
        [33mcollapsable[39m=[32m{true}[39m
        [33mpointerEvents[39m=[32m\\"box-none\\"[39m
      [36m>[39m
        [36m<View[39m
          [33maccessibilityRole[39m=[32m\\"tab\\"[39m
          [33maccessibilityStates[39m=[32m{
            Array [
              \\"selected\\",
            ]
          }[39m
          [33mtestID[39m=[32m\\"rnl-screen\\"[39m
        [36m>[39m
          [36m<View[39m
            [33maccessibilityStates[39m=[32m{
              Array [
                \\"selected\\",
              ]
            }[39m
            [33mtestID[39m=[32m\\"rnl-screen-2\\"[39m
          [36m>[39m
            [36m<Text[39m
              [33maccessibilityStates[39m=[32m{
                Array [
                  \\"disabled\\",
                ]
              }[39m
              [33mtestID[39m=[32m\\"rnl-screen\\"[39m
            [36m>[39m
              [0mI am not focused[0m
            [36m</Text>[39m
          [36m</View>[39m
        [36m</View>[39m
      [36m</View>[39m
    [36m</View>[39m"
  `);

  // @ts-ignore
  console.log.mockRestore();
});

test('navigate() calls work', () => {
  const spy = jest.spyOn(history, 'navigate');

  render(<Test />);

  navigate('/2');

  expect(spy).toHaveBeenCalled();
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
  const { container, rerender, debug } = render(
    <View testID="rnl-screen-1" accessibilityStates={['selected']}>
      <View testID="rnl-screen-2" accessibilityStates={['selected']}>
        <Text testID="rnl-screen-0" accessibilityStates={['disabled']}>
          I am not focused
        </Text>
      </View>

      <View testID="rnl-screen-1" accessibilityStates={['selected']}>
        <Text testID="rnl-screen-2" accessibilityStates={['selected']}>
          I am focused
        </Text>
      </View>
    </View>
  );

  let focused = findFocused(container);
  getByText(focused, 'I am focused');

  expect(() => getByText(focused, 'I am not focused')).toThrow();

  rerender(
    <View testID="rnl-screen-1" accessibilityStates={['selected']}>
      <View testID="rnl-screen-2" accessibilityStates={['selected']}>
        <View testID="rnl-screen-3" accessibilityStates={['selected']}>
          <Text testID="rnl-screen-4" accessibilityStates={['selected']}>
            I am now focused
          </Text>
        </View>
      </View>

      <View testID="rnl-screen-0" accessibilityStates={['disabled']}>
        <View testID="rnl-screen-0" accessibilityStates={['selected']}>
          <Text>I am not focused anymore</Text>
        </View>
      </View>
    </View>
  );

  focused = findFocused(container);

  getByText(focused, 'I am now focused');
  expect(() => getByText(focused, 'I am not focused anymore')).toThrow();
});

test('backPress() works', () => {
  fireEvent.androidBackPress();
});

test('openLink() works', () => {
  fireEvent.openLink('testest');
});
