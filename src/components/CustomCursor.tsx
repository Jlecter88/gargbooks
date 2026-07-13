"use client";

import React, { useState, useEffect, startTransition } from "react";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Guard against Hydration Mismatch: only execute on client side
  useEffect(() => {
    startTransition(() => setIsMounted(true));
  }, []);

  // Track mouse coordinates
  useEffect(() => {
    if (!isMounted || window.innerWidth <= 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMounted]);

  // Smooth LERP effect for follower circle
  useEffect(() => {
    if (!isMounted || window.innerWidth <= 768) return;

    let frameId: number;
    const updateFollower = () => {
      setFollowerPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        
        // If it's the initial jump from off-screen, snap to mousePos
        if (prev.x === -100 && prev.y === -100) {
          return { x: mousePos.x, y: mousePos.y };
        }
        
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      frameId = requestAnimationFrame(updateFollower);
    };
    frameId = requestAnimationFrame(updateFollower);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mousePos, isMounted]);

  // Event delegation to detect hover state on interactive elements
  useEffect(() => {
    if (!isMounted || window.innerWidth <= 768) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[role='button']") ||
        target.closest(".book-card") ||
        target.closest(".cursor-pointer") ||
        target.closest(".clickable-card") ||
        target.classList.contains("cursor-pointer");

      setIsHovered(!!isInteractive);
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isMounted]);

  if (!isMounted || typeof window === "undefined" || window.innerWidth <= 768) {
    return null;
  }

  return (
    <>
      <div
        id="custom-cursor"
        className={isHovered ? "cursor-active" : ""}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />
      <div
        id="custom-cursor-follower"
        className={isHovered ? "follower-active" : ""}
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
        }}
      />
    </>
  );
}
