import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

interface UseCardEffectsProps {
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  glowColor?: string;
  disableAnimations?: boolean;
}

export const useCardEffects = ({
  enableTilt = false,
  enableMagnetism = false,
  clickEffect = false,
  glowColor = '132, 0, 255',
  disableAnimations = false
}: UseCardEffectsProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    }

    if (enableMagnetism) {
      const magnetX = (x - centerX) * 0.05;
      const magnetY = (y - centerY) * 0.05;

      magnetismAnimationRef.current = gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [enableTilt, enableMagnetism, disableAnimations]);

  const handleMouseLeave = useCallback(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    if (enableTilt) {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (enableMagnetism) {
      magnetismAnimationRef.current?.kill();
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [enableTilt, enableMagnetism, disableAnimations]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!clickEffect || disableAnimations || !cardRef.current) return;

    const element = cardRef.current;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the maximum distance from click point to any corner
    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - rect.width, y),
      Math.hypot(x, y - rect.height),
      Math.hypot(x - rect.width, y - rect.height)
    );

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      pointer-events: none;
      z-index: 1000;
    `;

    element.appendChild(ripple);

    gsap.fromTo(
      ripple,
      {
        scale: 0,
        opacity: 1
      },
      {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  }, [clickEffect, disableAnimations, glowColor]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || disableAnimations) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
      magnetismAnimationRef.current?.kill();
    };
  }, [handleMouseMove, handleMouseLeave, handleClick, disableAnimations]);

  return cardRef;
};