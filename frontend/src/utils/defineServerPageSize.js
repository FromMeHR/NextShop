import { PAGE_SIZE } from "../constants/constants.js";

export function defineServerPageSize(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/cros|netbook|small/.test(ua)) {
    return PAGE_SIZE.smallDesktop;
  }
  if (/ipad|tablet|nexus 7|nexus 9|sm-t|kindle|silk/.test(ua)) {
    return PAGE_SIZE.tablet;
  }
  if (/mobi|android(?!.*tablet)|iphone|ipod/.test(ua)) {
    return PAGE_SIZE.mobile;
  }
  return PAGE_SIZE.desktop;
}
