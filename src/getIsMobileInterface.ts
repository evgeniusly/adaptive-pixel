interface IGetIsMobileInterface {
  setter: (value: boolean) => void;
  maxWidth?: number;
  maxHeight?: number;
}

const MOBILE_MAX_WIDTH = 900;
const MOBILE_MAX_HEIGHT = 540;

export const getIsMobileInterface = (params: IGetIsMobileInterface) => {
  const { setter } = params;
  let calculate = () => {};
  let startListeners = () => {};
  let cleanListeners = () => {};

  if (typeof window !== "undefined") {
    const mobileMaxWidth = params.maxWidth ?? MOBILE_MAX_WIDTH;
    const mobileMaxHeight = params.maxHeight ?? MOBILE_MAX_HEIGHT;

    const media = window.matchMedia(
      `(max-width: ${mobileMaxWidth}px), (max-height: ${mobileMaxHeight}px)`
    );

    const matcher = (event: MediaQueryListEvent) => {
      setter(event.matches);
    };

    calculate = () => {
      if (media) setter(media.matches);
    };

    startListeners = () => {
      if (media?.addListener) {
        media.addListener(matcher);
      } else if (media?.addEventListener) {
        media.addEventListener("change", matcher);
      }
    };
    cleanListeners = () => {
      if (media?.removeListener) {
        media.removeListener(matcher);
      } else if (media?.removeEventListener) {
        media.removeEventListener("change", matcher);
      }
    };
  }

  return { calculate, startListeners, cleanListeners };
};
