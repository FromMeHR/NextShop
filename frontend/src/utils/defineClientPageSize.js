import { PAGE_SIZE, SCREEN_WIDTH } from "../constants/constants";

export function defineClientPageSize(windowWidth) {
  if (windowWidth < SCREEN_WIDTH.tablet) {
    return PAGE_SIZE.mobile;
  }
  if (windowWidth < SCREEN_WIDTH.smallDesktop) {
    return PAGE_SIZE.tablet;
  }
  if (windowWidth < SCREEN_WIDTH.desktop) {
    return PAGE_SIZE.smallDesktop;
  }
  return PAGE_SIZE.desktop;
}
