'use client';

import * as React from 'react';
import {
  SVGMotionProps,
  useAnimation,
  type Variants,
} from 'motion/react';

import { cn } from '@/lib/utils';

const staticAnimations = {
  path: {
    initial: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0.05, 1],
      opacity: [0, 1],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        opacity: { duration: 0.01 },
      },
    },
  } as Variants,
  'path-loop': {
    initial: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [1, 0.05, 1],
      opacity: [1, 0, 1],
      transition: {
        duration: 1.6,
        ease: 'easeInOut',
        opacity: { duration: 0.01 },
      },
    },
  } as Variants,
} as const;

type StaticAnimations = keyof typeof staticAnimations;
type TriggerProp<T = string> = boolean | StaticAnimations | T;

interface AnimateIconContextValue {
  controls: ReturnType<typeof useAnimation> | undefined;
  animation: StaticAnimations | string;
  loop: boolean;
  loopDelay: number;
}

interface DefaultIconProps<T = string> {
  animate?: TriggerProp<T>;
  onAnimateChange?: (
    value: boolean,
    animation: StaticAnimations | string,
  ) => void;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animation?: T | StaticAnimations;
  loop?: boolean;
  loopDelay?: number;
  onAnimateStart?: () => void;
  onAnimateEnd?: () => void;
}

type AnimateIconChildProps = {
  onMouseEnter?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onPointerDown?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: React.PointerEvent<SVGSVGElement>) => void;
};

interface AnimateIconProps<T = string> extends DefaultIconProps<T> {
  children: React.ReactElement<AnimateIconChildProps>;
}

interface IconProps<T>
  extends DefaultIconProps<T>,
    Omit<
      SVGMotionProps<SVGSVGElement>,
      'animate' | 'onAnimationStart' | 'onAnimationEnd'
    > {
  size?: number;
}

interface IconWrapperProps<T> extends IconProps<T> {
  icon: React.ComponentType<IconProps<T>>;
}

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(
  null,
);

function useAnimateIconContext() {
  const context = React.useContext(AnimateIconContext);
  if (!context)
    return {
      controls: undefined,
      animation: 'default',
      loop: false,
      loopDelay: 0,
    };
  return context;
}

function AnimateIcon({
  animate,
  onAnimateChange,
  animateOnHover,
  animateOnTap,
  animation = 'default',
  loop = false,
  loopDelay = 0,
  onAnimateStart,
  onAnimateEnd,
  children,
}: AnimateIconProps) {
  const controls = useAnimation();
  const isControlled = animate !== undefined;
  const initialAnimation = typeof animate === 'string' ? animate : animation;
  const [internalAnimate, setInternalAnimate] = React.useState(Boolean(animate));
  const [internalAnimation, setInternalAnimation] =
    React.useState<StaticAnimations | string>(initialAnimation);
  const resolvedAnimate = isControlled ? Boolean(animate) : internalAnimate;
  const resolvedAnimation = isControlled ? initialAnimation : internalAnimation;

  const startAnimation = React.useCallback(
    (trigger: TriggerProp) => {
      const nextAnimation =
        typeof trigger === 'string' ? trigger : animation;

      if (isControlled) {
        onAnimateChange?.(true, nextAnimation);
        return;
      }

      setInternalAnimation(nextAnimation);
      setInternalAnimate(true);
    },
    [animation, isControlled, onAnimateChange],
  );

  const stopAnimation = React.useCallback(() => {
    if (isControlled) {
      onAnimateChange?.(false, resolvedAnimation);
      return;
    }

    setInternalAnimate(false);
  }, [isControlled, onAnimateChange, resolvedAnimation]);

  React.useEffect(
    () => onAnimateChange?.(resolvedAnimate, resolvedAnimation),
    [resolvedAnimate, resolvedAnimation, onAnimateChange],
  );

  React.useEffect(() => {
    if (resolvedAnimate) onAnimateStart?.();
    controls.start(resolvedAnimate ? 'animate' : 'initial').then(() => {
      if (resolvedAnimate) onAnimateEnd?.();
    });
  }, [resolvedAnimate, controls, onAnimateStart, onAnimateEnd]);

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animateOnHover) startAnimation(animateOnHover);
    children.props?.onMouseEnter?.(e);
  };
  const handleMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animateOnHover || animateOnTap) stopAnimation();
    children.props?.onMouseLeave?.(e);
  };
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (animateOnTap) startAnimation(animateOnTap);
    children.props?.onPointerDown?.(e);
  };
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (animateOnTap) stopAnimation();
    children.props?.onPointerUp?.(e);
  };

  const child = React.Children.only(children);
  const cloned = React.cloneElement(child, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  });

  return (
    <AnimateIconContext.Provider
      value={{
        controls,
        animation: resolvedAnimation,
        loop,
        loopDelay,
      }}
    >
      {cloned}
    </AnimateIconContext.Provider>
  );
}

const pathClassName =
  "[&_[stroke-dasharray='1px_1px']]:![stroke-dasharray:1px_0px]";

function IconWrapper<T extends string>({
  size = 28,
  animation: animationProp,
  animate,
  onAnimateChange,
  animateOnHover = false,
  animateOnTap = false,
  icon: IconComponent,
  loop = false,
  loopDelay = 0,
  onAnimateStart,
  onAnimateEnd,
  className,
  ...props
}: IconWrapperProps<T>) {
  const context = React.useContext(AnimateIconContext);

  if (context) {
    const {
      controls,
      animation: parentAnimation,
      loop: parentLoop,
      loopDelay: parentLoopDelay,
    } = context;
    const animationToUse = animationProp ?? parentAnimation;
    const loopToUse = loop || parentLoop;
    const loopDelayToUse = loopDelay || parentLoopDelay;

    return (
      <AnimateIconContext.Provider
        value={{
          controls,
          animation: animationToUse,
          loop: loopToUse,
          loopDelay: loopDelayToUse,
        }}
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationToUse === 'path' || animationToUse === 'path-loop') &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIconContext.Provider>
    );
  }

  if (
    animate !== undefined ||
    onAnimateChange !== undefined ||
    animateOnHover ||
    animateOnTap ||
    animationProp
  ) {
    return (
      <AnimateIcon
        animate={animate}
        onAnimateChange={onAnimateChange}
        animateOnHover={animateOnHover}
        animateOnTap={animateOnTap}
        animation={animationProp}
        loop={loop}
        loopDelay={loopDelay}
        onAnimateStart={onAnimateStart}
        onAnimateEnd={onAnimateEnd}
      >
        <IconComponent
          size={size}
          className={cn(
            className,
            (animationProp === 'path' || animationProp === 'path-loop') &&
              pathClassName,
          )}
          {...props}
        />
      </AnimateIcon>
    );
  }

  return (
    <IconComponent
      size={size}
      className={cn(
        className,
        (animationProp === 'path' || animationProp === 'path-loop') &&
          pathClassName,
      )}
      {...props}
    />
  );
}

function useIconVariants<
  V extends { default: T; [key: string]: T },
  T extends Record<string, Variants>,
>(animations: V): T {
  const { animation: animationType, loop, loopDelay } = useAnimateIconContext();

  let result: T;

  if (animationType in staticAnimations) {
    const variant = staticAnimations[animationType as StaticAnimations];
    result = {} as T;
    for (const key in animations.default) {
      if (
        (animationType === 'path' || animationType === 'path-loop') &&
        key.includes('group')
      )
        continue;
      result[key] = variant as T[Extract<keyof T, string>];
    }
  } else {
    result = (animations[animationType as keyof V] as T) ?? animations.default;
  }

  if (loop) {
    for (const key in result) {
      const state = result[key] as {
        animate?: {
          transition?: Record<string, unknown>;
        };
      };
      const transition = state.animate?.transition;
      if (!transition) continue;

      const hasNestedKeys = Object.values(transition).some(
        (v) =>
          typeof v === 'object' &&
          v !== null &&
          ('ease' in v || 'duration' in v || 'times' in v),
      );

      if (hasNestedKeys) {
        for (const prop in transition) {
          const subTrans = transition[prop];
          if (typeof subTrans === 'object' && subTrans !== null) {
            transition[prop] = {
              ...subTrans,
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: loopDelay,
            };
          }
        }
      } else if (state.animate) {
        state.animate.transition = {
          ...transition,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: loopDelay,
        };
      }
    }
  }

  return result;
}

export {
  pathClassName,
  staticAnimations,
  AnimateIcon,
  IconWrapper,
  useAnimateIconContext,
  useIconVariants,
  type IconProps,
  type IconWrapperProps,
  type AnimateIconProps,
  type AnimateIconContextValue,
};
