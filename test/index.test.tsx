import React from 'react';
import { render, navigate, cleanup } from '../src';
import { Text } from 'react-native';
import { Navigator, Tabs, history } from 'react-navigation-library';

let log: any;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(output => (log = output));
});

function Test() {
  return (
    <Navigator routes={['1', '2']}>
      <Tabs style={{ width: 1 }}>
        <Text testID="123">1</Text>
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
  expect(!log.includes('testID')).toBe(true);

  expect(log).toMatchInlineSnapshot(`
    "[36m<View[39m
      [33maccessibilityRole[39m=[32m\\"tab\\"[39m
      [33maccessibilityStates[39m=[32m{
        Array [
          \\"selected\\",
        ]
      }[39m
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
      [36m<Text[39m
        [33mtestID[39m=[32m\\"123\\"[39m
      [36m>[39m
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
