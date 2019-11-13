# navigation-test-utils

A utility library for testing w/ navigation-components

Provides some nice additions to the `@testing-library/react-native` `render()` method, as well as out of the box mocks to get up and running quickly with jest

## Install

```bash
yarn add navigation-test-utils
```

## Dependencies

navigation-components and this utility library share peer dependencies:

```bash
yarn add react-native-gesture-handler react-native-screens react-native-reanimated
```

this library also relies on these dev dependencies:

```bash
yarn add --dev @testing-library/react-native @testing-library/jest-native
```

Jest config:

```json
  // ...

  "jest": {
    "preset": "@testing-library/react-native",
    "modulePathIgnorePatterns": [
      "<rootDir>/example"
    ],
    "transformIgnorePatterns": [
      "node_modules/(?!(react-native|react-native-screens|react-native-reanimated)/)"
    ],
    "setupFilesAfterEnv": [
      "@testing-library/react-native/cleanup-after-each",
      "navigation-test-utils/setup",
      "navigation-test-utils/cleanup-after-each"
    ],
    "transform": {
      "^.+\\.(t)sx?$": "ts-jest"
    }
  }
```

## Reference

```javascript
import {render, navigate} from 'navigation-test-utils

test('app', () => {
  navigate('/welcome') // navigates to an initial screen before starting the test

  const { getFocused } = render(<MyApp />)

  getFocused().debug() // outputs the current focused screen
  getFocused().getByText(/welcome/i) // query anything on the focused screen

  navigate('/deep/in/the/app') // navigate anywhere

  getFocused().debug() // e.g a deeply nested screen
})
```
