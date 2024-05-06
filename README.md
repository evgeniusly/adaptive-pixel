# adaptive-pixel

Provides a _multiplier value_ for interface scaling via CSS and JS. Based on customizable media breakpoints.

Also contains SASS mixins for ease of use.

## How it works

1. You can set _breakpoints_ for different scaling on different screen resolutions (depending on your mockups).
2. The script will calculate the _screen scaling multiplier value_ and add/remove listeners to recalculate on window 'resize' and 'orientationchange' events.
3. This _multiplier value_ will be stored/updated in CSS variable `--apx` in _:root_ of _documetn_. And also sent as a _numder_ to _callback_.
4. In SASS you can use it with helpful mixins that convert incoming values to CSS syntax `calc(var(--apx, 1px) * #{$your_value})`.
5. If you set _breakpoints_ according to your mockups, you can take all sizes as is from there for use in mixins. In this case, mockup content will be scaled in the _viewport_ with _contain_ strategy.<br/>(see more below)

## Demo

[React + SCSS](https://codesandbox.io/p/sandbox/adaptive-pixel-example-base-myvjdl)

## Installation

```shell
npm i adaptive-pixel
```

## Usage JS

### 📜 getApxInterface

Function retun an interface that can calculates a _multiplier value_ for scaling, and can add/remove listeneres for refresh value on window 'resize' and 'orientationchange' events.

After calculation (and if this is a new value)
puts it to CSS variable `--apx` to the _:root_ of _document_,
and also sends a new value to the callback function.

```ts
import { getApxInterface } from "adaptive-pixel";

const params = {
  setter: (value: number) => console.log("apx", value),
  breakpoints: [[...], [...], ...],
};

const { calculate, startListeners, cleanListeners } = getApxInterface(params);
```

#### params

| Property      | Describe                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `setter`      | _(optional)_ \| `(value: number) => void`<br />Callback that fires when a new _apx_ value is calculated. Recive a new value as a number. |
| `breakpoints` | _(optional)_ \| `[number, number, number?, number?][]`<br />Array of breakepionts.<br />Default: see below.                              |

All breakepoints listed in descending order of priority.
Each breakpoint contains [_mockup width_, _mockup height_, _screen min-width_, _screen min-height_].<br />
Default values, for example:

```js
[
  [1440, 750, 900, 540], // "Desktop"
  [360, 1, 300, 300], // "Mobile"
];
```

In this case we have two mockup resolutions: "Desktop" `1440 x 750` and "Mobile" `360 x any`.

1. First we check that the screen `(min-width: 900px) and (min-height: 540px)`.
   If it's true, "Desktop" content will scale on screen with contain strategy.
   If not — go to the next breakpoint.
2. Now we check that the screen `(min-width: 300px) and (min-height: 300px)`.
   If it's true, "Mobile" content will scale on screen with contain strategy (and _mockup height_ = 1 means that screen height does not need to be taken into account).
3. If there are no more breakpoints in the list, then set _scale multiplier_ to 1 (no scaling at all).

#### Instance methods

| Method             | Describe                                                                           |
| ------------------ | ---------------------------------------------------------------------------------- |
| `calculate()`      | Run calculation.                                                                   |
| `startListeners()` | Add listeners to window 'resize' and 'orientationchange' events for recalculation. |
| `cleanListeners()` | Remove listeners.                                                                  |

---

### 📜 getIsMobileInterface

Function retun an interface that can return _match media_ check result (see below), and can add/remove listeneres for refresh value on _match media_ update.

After _match media_ checking or updating sends a new value to the callback function.

```ts
import { getIsMobileInterface } from "adaptive-pixel";

const params = {
  setter: (value: boolean) => console.log("isMobile", value),
  maxWidth: 900,
  maxHeight: 540,
};

const { calculate, startListeners, cleanListeners } =
  getIsMobileInterface(params);
```

#### params

| Property    | Describe                                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setter`    | (required) `(value: boolean) => void`<br />Callback that fires when a new _"is mobile"_ state value is calculated. Recive a new value as a boolean. |
| `maxWidth`  | (optional) `number`<br />Default: `900`<br />                                                                                                       |
| `maxHeight` | (optional) `number`<br />Default: `540`<br />                                                                                                       |

**setter** recive _true_ when match media is `(max-width: ${maxWidth}px), (max-height: ${maxHeight}px)` (viewport width < _maxWidth_ OR height < _maxHeight_).

> **Note:** Deafult _maxWidth_ and _maxHeight_ of **getIsMobileInterface** works great with default _breakpoints_ of **getApxInterface**. If you set your own _breakpoints_, update those too.

#### Instance methods

| Method             | Describe                                                  |
| ------------------ | --------------------------------------------------------- |
| `calculate()`      | Run calculation.                                          |
| `startListeners()` | Add _window.matchMedia_ event listener for recalculation. |
| `cleanListeners()` | Remove listeners.                                         |

## Usage SASS

This package contains SASS mixins and functions to work with _adaptive-pixel_.

To use them in a _.sass_ file, place it at the top:

```sass
@use 'adaptive-pixel/dist/mixins' as *
```

### Functions

#### 📜 apx($value [$value2 [...]])

Arguments: `number [number [...]]`

Converts one or more values to `calc(var(--apx, 1px) * #{$value})` each. Zero will remain `0`.

```sass
.block
  padding: apx(20 0 12)

// output
.block
  padding: calc(var(--apx, 1px) * 20) 0 calc(var(--apx, 1px) * 12)
```

---

### Mixins

#### 📜 +afs($size [, $height [, $weight]])

Arguments: `number [, (number | number% | null) [, (number | string)]]`

`+afs()` will return _font-size_, and if values are given _line-height_ and _font-weight_ CSS properties.<br />

| Argument                                                   | Output examples                                                                                                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$size`<br />`number`                                      | `16` => `font-size: apx(16)`                                                                                                                                                                                                  |
| `$height`<br />(optional)<br />`number \| number% \| null` | _zero_<br />`0` => `line-height: normal`<br /><br />_number non zero_<br />`18` => `line-height: apx(18)`<br /><br />_number + %_<br />`130%` => `line-height: 130%`<br /><br />_null_<br />`null` => no _line-height_ output |
| `$weight`<br />(optional)<br />`number \| string`          | `700` => `font-weight: 700`<br />`bold` => `font-weight: bold`<br />                                                                                                                                                          |

```sass
.text
  +afs(20, 130%, 700)

// output
.text
  font-size: apx(20)
  line-height: 130%
  font-weight: 700
```

---

#### 📜 +awh($width [, $height])

#### 📜 +alt($left [, $top])

#### 📜 +art($right [, $top])

#### 📜 +arb($right [, $bottom])

#### 📜 +alb($left [, $bottom])

Arguments: `number [, number]]`

`+awh()` will return _width_ and _height_ CSS properties.<br />
If `$height` is not provided, `$width` will be used for the _height_ (eg: `+awh(100)` is equal to `+awh(100, 100)`).

Same for other mixins, but for the _left_, _top_, _right_ and _bottom_ respectively.

```sass
.block
  +awh(100)

// output
.block
  width: apx(100)
  height: apx(100)
```

---

#### 📜 +desktop

#### 📜 +mobile

This mixins will wrap CSS properties of the selector into the `@media` rules.

| Mixin      | Media rule                                   |
| ---------- | -------------------------------------------- |
| `+desktop` | `(min-width: 901px) and (min-height: 541px)` |
| `+mobile`  | `(max-width: 900px), (max-height: 540px)`    |

```sass
.block
  background: #FFF
  +desktop
    +awh(100, 200)
  +mobile
    +awh(60)

// output
.block
  background: #FFF

@media (min-width: 901px) and (min-height: 541px)
  .block
    width: calc(var(--apx, 1px)* 100)
    height: calc(var(--apx, 1px)* 200)

@media (max-width: 900px), (max-height: 540px)
  .block
    width: calc(var(--apx, 1px)* 60)
    height: calc(var(--apx, 1px)* 60)
```

> **Note:** If you set your own _breakpoints_, you should make your own media mixins.

## Examples

Below are examples for the **getApxInterface**, but the same for the **getIsMobileInterface**.

### TS

```ts
import { getApxInterface } from "adaptive-pixel";

// will be called when the value is updated
const yourSetterCallback = (value: number) => console.log("apx", value);

const { calculate, startListeners, cleanListeners } = getApxInterface({
  setter: yourSetterCallback,
});

calculate(); // first run (on load, eg)
startListeners();

cleanListeners(); // remove listeners for cleanup if necessary
```

### React

```tsx
import { getApxInterface } from "adaptive-pixel";

export const SomeRootComponent: React.FC = () => {
  const [apx, setApx] = useState(1);

  useEffect(() => {
    const { calculate, startListeners, cleanListeners } = getApxInterface({
      setter: setApx,
    });

    calculate();
    startListeners();

    return () => {
      cleanListeners();
    };
  }, []);

  useEffect(() => console.log("apx", apx), [apx]);
  // ...
};
```

### Svelte

```ts
// $lib/store/adaptivePixel.ts
import { writable } from "svelte/store";
import { getApxInterface } from "adaptive-pixel";

const createApxStore = () => {
  const { subscribe, set } = writable(1);
  const { calculate, startListeners, cleanListeners } = getApxInterface({
    setter: set,
  });

  return { subscribe, calculate, startListeners, cleanListeners };
};

const adaptivePixel = createApxStore();
export default adaptivePixel;
```

```js
// +layout.svelte
import adaptivePixel from "$lib/store/adaptivePixel";

onMount(() => {
  adaptivePixel.calculate();
  adaptivePixel.startListeners();

  return () => {
    adaptivePixel.cleanListeners();
  };
});

$: console.log("adaptivePixel", $adaptivePixel);
```

### SASS

```sass
@use 'adaptive-pixel/dist/mixins' as *

.block
  +awh(100, 200)
  padding: apx(40 20 30)

  +desktop
    +alt(20)
  +mobile
    +arb(16, 24)

.text
  +afs(20, 130%, 700)

  +desktop
    color: #C00
  +mobile
    color: #0C0
```

## License

MIT
