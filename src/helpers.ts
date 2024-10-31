export const apxCssValue = (val: number): string =>
  `calc(var(--apx, 1px) * ${val})`;
