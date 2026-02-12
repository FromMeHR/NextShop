"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import css from "./Scrollbar.module.css";

export const Scrollbar = ({ scrollContainerRef, dependencies = [] }) => {
  const [isThumbActive, setIsThumbActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const disableSnap = (container) => {
    container.style.scrollBehavior = "auto";
    container.style.scrollSnapType = "none";
  };

  const enableSnap = (container) => {
    container.style.scrollBehavior = "smooth";
    container.style.scrollSnapType = "x mandatory";
  };

  const updateThumb = useCallback(() => {
    const container = scrollContainerRef.current;
    const scrollbar = scrollbarRef.current;
    const thumb = thumbRef.current;

    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setIsVisible(scrollWidth > clientWidth + 1);

    if (!scrollbar || !thumb) return;
    const scrollRatio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(scrollbar.clientWidth * scrollRatio, 1);
    const maxThumbX = scrollbar.clientWidth - thumbWidth;
    const thumbX = (scrollLeft / (scrollWidth - clientWidth)) * maxThumbX;

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${thumbX}px)`;
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateThumb();
    container.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);

    return () => {
      container.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
    };
  }, [isVisible, scrollContainerRef, updateThumb, ...dependencies]);

  const onThumbPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const container = scrollContainerRef.current;
    if (!container) return;

    isDragging.current = true;
    setIsThumbActive(true);

    disableSnap(container);

    startX.current = e.clientX;
    startScrollLeft.current = container.scrollLeft;

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;

    const container = scrollContainerRef.current;
    const scrollbar = scrollbarRef.current;
    const thumb = thumbRef.current;

    const delta = e.clientX - startX.current;
    const scrollRatio =
      (container.scrollWidth - container.clientWidth) /
      (scrollbar.clientWidth - thumb.clientWidth);
    container.scrollLeft =
      startScrollLeft.current + delta * scrollRatio;
  };

  const onPointerUp = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const firstChild = container.firstElementChild;
    if (!firstChild) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    if (isAtEnd) {
      enableSnap(container);
    } else {
      const containerStyle = window.getComputedStyle(container);
      const columnGap = parseFloat(containerStyle.columnGap) || 0;
      const itemWidth = firstChild.offsetWidth + columnGap;

      const closestStep = Math.round(scrollLeft / itemWidth);
      const targetSnapPoint = closestStep * itemWidth;

      container.scrollTo({
        left: targetSnapPoint,
        behavior: "smooth"
      });
      enableSnap(container);
    }

    isDragging.current = false;
    setIsThumbActive(false);

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  const onScrollbarClick = (e) => {
    if (e.target === thumbRef.current) return;

    const scrollbar = scrollbarRef.current;
    const container = scrollContainerRef.current;
    const thumb = thumbRef.current;
    if (!scrollbar || !container || !thumb) return;

    disableSnap(container);

    const rect = scrollbar.getBoundingClientRect();

    isDragging.current = true;
    setIsThumbActive(true);

    const clickX = e.clientX - rect.left;
    const halfThumbWidth = thumb.clientWidth / 2;
    const availableTrackWidth = scrollbar.clientWidth - thumb.clientWidth;

    let ratio = (clickX - halfThumbWidth) / availableTrackWidth;
    ratio = Math.max(0, Math.min(1, ratio));

    const maxScroll = container.scrollWidth - container.clientWidth;
    const newScrollLeft = ratio * maxScroll;

    container.scrollTo({ left: newScrollLeft });
    startX.current = e.clientX;
    startScrollLeft.current = newScrollLeft;

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  };

  return isVisible && (
    <div className={css["custom-scrollbar"]} ref={scrollbarRef} onPointerDown={onScrollbarClick}>
      <div
        className={`${css["custom-scrollbar__thumb"]} ${isThumbActive ? css["active"] : ""}`}
        ref={thumbRef}
        onPointerDown={onThumbPointerDown}
      />
    </div>
  );
};