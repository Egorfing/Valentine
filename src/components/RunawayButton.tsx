import { type PointerEvent, type RefObject, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@mantine/core";

type Position = {
  x: number;
  y: number;
};

type RunawayButtonProps = {
  arenaRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
};

const BUTTON_WIDTH = 168;
const BUTTON_HEIGHT = 60;
const MOBILE_BUTTON_WIDTH = 84;
const MOBILE_BUTTON_HEIGHT = 30;
const PROXIMITY_PX = 5;

function distanceToRect(x: number, y: number, rectX: number, rectY: number, rectW: number, rectH: number): number {
  const dx = Math.max(rectX - x, 0, x - (rectX + rectW));
  const dy = Math.max(rectY - y, 0, y - (rectY + rectH));
  return Math.hypot(dx, dy);
}

export default function RunawayButton({ arenaRef, disabled }: RunawayButtonProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [buttonSize, setButtonSize] = useState(() => {
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;
    return isDesktop
      ? { width: BUTTON_WIDTH, height: BUTTON_HEIGHT }
      : { width: MOBILE_BUTTON_WIDTH, height: MOBILE_BUTTON_HEIGHT };
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px)");
    const updateButtonSize = (): void => {
      setButtonSize(
        mediaQuery.matches
          ? { width: BUTTON_WIDTH, height: BUTTON_HEIGHT }
          : { width: MOBILE_BUTTON_WIDTH, height: MOBILE_BUTTON_HEIGHT }
      );
    };
    updateButtonSize();
    mediaQuery.addEventListener("change", updateButtonSize);
    return () => mediaQuery.removeEventListener("change", updateButtonSize);
  }, []);

  const moveAway = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena || disabled) {
      return;
    }

    const bounds = arena.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - buttonSize.width);
    const maxY = Math.max(0, bounds.height - buttonSize.height);

    // Randomize next target point, but keep the button inside the visible area.
    setPosition({
      x: Math.random() * maxX,
      y: Math.random() * maxY
    });
  }, [arenaRef, buttonSize.height, buttonSize.width, disabled]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) {
      return;
    }

    const bounds = arena.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - buttonSize.width);
    const startY = Math.max(0, (bounds.height - buttonSize.height) / 2);
    // Keep initial spot on the right side; moving starts only on close cursor/touch interaction.
    setPosition({ x: maxX, y: startY });
  }, [arenaRef, buttonSize.height, buttonSize.width]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || disabled) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent): void => {
      const bounds = arena.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      const distance = distanceToRect(pointerX, pointerY, position.x, position.y, buttonSize.width, buttonSize.height);

      if (distance <= PROXIMITY_PX) {
        moveAway();
      }
    };

    arena.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      arena.removeEventListener("pointermove", handlePointerMove);
    };
  }, [arenaRef, buttonSize.height, buttonSize.width, disabled, moveAway, position.x, position.y]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    moveAway();
  };

  return (
    <motion.div
      className="runaway"
      animate={position}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      <Button
        className="no-btn"
        color="red"
        variant="outline"
        w={buttonSize.width}
        h={buttonSize.height}
        onPointerDown={handlePointerDown}
        disabled={disabled}
      >
        Нет
      </Button>
    </motion.div>
  );
}
