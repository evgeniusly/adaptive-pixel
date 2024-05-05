// [mockup width, mockup height, screen min-width, screen min-height]
type Breakpoint = [number, number, number?, number?];
interface IGetApxInterfaceParams {
  setter?: (value: number) => void;
  breakpoints?: Breakpoint[];
}

const APX_DEFAULT_BREAKPOINTS: Breakpoint[] = [
  [1440, 750, 900, 540],
  [360, 1, 300, 300],
];

export const getApxInterface = (params: IGetApxInterfaceParams = {}) => {
  const { setter } = params;
  let calculate = () => {};
  let startListeners = () => {};
  let cleanListeners = () => {};

  if (typeof window !== "undefined") {
    const breakpoints: Breakpoint[] =
      params.breakpoints || APX_DEFAULT_BREAKPOINTS;

    let prevValue: number | null = null;

    // init MediaQueryList
    const medias = breakpoints.map((sizes) => {
      const media = window.matchMedia(
        `(min-width: ${sizes[2] || sizes[0]}px)
         and
         (min-height: ${sizes[3] || sizes[1]}px)`
      );
      return { media, sizes };
    });

    const updateAdaptivePixel = (value: number) => {
      if (value === prevValue) return;
      prevValue = value;
      document.documentElement.style.setProperty("--apx", `${value}px`);
      if (typeof setter === "function") setter(value);
    };

    calculate = () => {
      // select breakpoint
      let breakpoint: Breakpoint | undefined;
      for (const item of medias) {
        if (item.media.matches) {
          breakpoint = item.sizes;
          break;
        }
      }

      // if no matches -> use default 1
      if (!breakpoint) {
        updateAdaptivePixel(1);
        return;
      }

      // else -> calc adaptivePixel
      // const winW = document.documentElement.clientWidth
      // const winH = document.documentElement.clientHeight
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const windowRes = winW / winH;
      const screenBaseRes = breakpoint[0] / breakpoint[1];

      const adaptivePixel =
        screenBaseRes > windowRes
          ? // narrow window
            winW / breakpoint[0]
          : // wide window
            winH / breakpoint[1];

      // apply
      updateAdaptivePixel(adaptivePixel);
    };

    startListeners = () => {
      window.addEventListener("resize", calculate);
      window.addEventListener("orientationchange", calculate);
      screen?.orientation?.addEventListener("change", calculate);
    };
    cleanListeners = () => {
      window.removeEventListener("resize", calculate);
      window.removeEventListener("orientationchange", calculate);
      screen?.orientation?.addEventListener("change", calculate);
    };
  }

  return { calculate, startListeners, cleanListeners };
};
