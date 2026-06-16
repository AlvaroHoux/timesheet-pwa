/**
 * Módulo utilitário para lidar com eventos de pressão longa (long press) e cliques simples.
 * Evita repetição de código ao ser reutilizável em qualquer elemento HTML.
 */
export function applyLongPress(
    element: HTMLElement,
    durationMs: number,
    onLongPress: () => void,
    onClick?: () => void,
    onPressStart?: () => void,
    onPressCancel?: () => void
  ): void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isPressing = false;
    let longPressTriggered = false;
  
    const start = (e: Event) => {
      // Ignora múltiplos toques simultâneos
      if (e.type === 'touchstart' && (e as TouchEvent).touches.length > 1) return;
      if (e.cancelable) e.preventDefault(); // Previne seleção de texto e menu de contexto mobile
      
      if (isPressing) return;
      isPressing = true;
      longPressTriggered = false;
      
      if (onPressStart) onPressStart();
  
      timer = setTimeout(() => {
        longPressTriggered = true;
        onLongPress();
      }, durationMs);
    };
  
    const cancel = (e: Event) => {
      if (!isPressing) return;
      isPressing = false;
      
      if (timer) clearTimeout(timer);
  
      // Se a pressão foi cancelada antes do tempo e não foi evento de saída do mouse, dispara clique simples
      if (!longPressTriggered && onClick && e.type !== 'mouseleave' && e.type !== 'touchcancel') {
        onClick();
      }
      
      if (onPressCancel) onPressCancel();
    };
  
    element.addEventListener("mousedown", start);
    element.addEventListener("mouseup", cancel);
    element.addEventListener("mouseleave", cancel);
    element.addEventListener("touchstart", start, { passive: false });
    element.addEventListener("touchend", cancel);
    element.addEventListener("touchcancel", cancel);
  }