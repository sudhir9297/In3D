import { useState, useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";

type ActionType = "click" | "drag";

type Position = {
  x: number;
  y: number;
};

type ActionCallback = (
  action: ActionType,
  event: ThreeEvent<PointerEvent>
) => void;

interface UseClickOrDragReturn {
  onMouseDown: (event: ThreeEvent<PointerEvent>) => void;
  onMouseUp: (
    event: ThreeEvent<PointerEvent>,
    onAction: ActionCallback
  ) => void;
}

const useClickOrDrag = (
  clickThreshold: number = 5,
  timeThreshold: number = 200
): UseClickOrDragReturn => {
  const [startPosition, setStartPosition] = useState<Position>({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState<number>(0);

  const onMouseDown = useCallback((event: ThreeEvent<PointerEvent>): void => {
    setStartPosition({ x: event.clientX, y: event.clientY });
    setStartTime(performance.now());
  }, []);

  const onMouseUp = useCallback(
    (event: ThreeEvent<PointerEvent>, onAction: ActionCallback): void => {
      const endX = event.clientX;
      const endY = event.clientY;
      const endTime = performance.now();

      const distance = Math.sqrt(
        Math.pow(endX - startPosition.x, 2) +
          Math.pow(endY - startPosition.y, 2)
      );
      const timeElapsed = endTime - startTime;

      if (distance < clickThreshold && timeElapsed < timeThreshold) {
        onAction("click", event);
      } else {
        onAction("drag", event);
      }
    },
    [startPosition, startTime, clickThreshold, timeThreshold]
  );

  return { onMouseDown, onMouseUp };
};

export default useClickOrDrag;
