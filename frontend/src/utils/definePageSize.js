import { PAGE_SIZE, SCREEN_WIDTH } from "../constants/constants";

const definePageSize = (windowWidth, setPageSize) => {
  if (windowWidth < SCREEN_WIDTH.tablet) {
    return setPageSize(PAGE_SIZE.mobile);
  }
  if (windowWidth < SCREEN_WIDTH.smallDesktop) {
    return setPageSize(PAGE_SIZE.tablet);
  }
  if (windowWidth < SCREEN_WIDTH.desktop) {
    return setPageSize(PAGE_SIZE.smallDesktop);
  }
  return setPageSize(PAGE_SIZE.desktop);
}

export default definePageSize;