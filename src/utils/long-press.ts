/**
 * Módulo utilitário para lidar com eventos de pressão longa (long press) e cliques simples.
 * Evita repetição de código ao ser reutilizável em qualquer elemento HTML.
 * Atualizado na v6: Adicionado suporte inteligente a scroll para evitar acionamentos acidentais.
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
    let startX = 0;
    let startY = 0;
  
    const start = (e: Event) => {
      // Ignora múltiplos toques simultâneos
      if (e.type === 'touchstart' && (e as TouchEvent).touches.length > 1) return;
      
      if (e.type === 'mousedown' && e.cancelable) {
          e.preventDefault(); // Apenas previne no desktop para não selecionar texto
      }
      
      if (isPressing) return;
      isPressing = true;
      longPressTriggered = false;

      // Grava a posição inicial do toque/clique
      if (e.type === 'touchstart') {
          startX = (e as TouchEvent).touches[0].clientX;
          startY = (e as TouchEvent).touches[0].clientY;
      } else if (e.type === 'mousedown') {
          startX = (e as MouseEvent).clientX;
          startY = (e as MouseEvent).clientY;
      }
      
      if (onPressStart) onPressStart();
  
      timer = setTimeout(() => {
        longPressTriggered = true;
        onLongPress();
      }, durationMs);
    };

    const move = (e: Event) => {
      if (!isPressing) return;
      
      let currentX = 0;
      let currentY = 0;
      
      if (e.type === 'touchmove') {
          currentX = (e as TouchEvent).touches[0].clientX;
          currentY = (e as TouchEvent).touches[0].clientY;
      } else if (e.type === 'mousemove') {
          currentX = (e as MouseEvent).clientX;
          currentY = (e as MouseEvent).clientY;
      }

      // Se moveu mais de 10 pixels, consideramos que é um scroll e cancelamos a ação
      if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) {
          cancel(e, true);
      }
    };
  
    const cancel = (e: Event, isMove: boolean = false) => {
      if (!isPressing) return;
      isPressing = false;
      
      if (timer) clearTimeout(timer);
  
      // Dispara clique simples apenas se não foi longo E não foi cancelado por movimento de tela
      if (!longPressTriggered && onClick && !isMove && e.type !== 'mouseleave' && e.type !== 'touchcancel') {
        onClick();
      }
      
      if (onPressCancel) onPressCancel();
    };
  
    element.addEventListener("mousedown", start);
    element.addEventListener("mousemove", move, { passive: true });
    element.addEventListener("mouseup", (e) => cancel(e));
    element.addEventListener("mouseleave", (e) => cancel(e));
    
    // O uso do passive: true permite o scroll nativo rodar sem bloqueios
    element.addEventListener("touchstart", start, { passive: true });
    element.addEventListener("touchmove", move, { passive: true });
    element.addEventListener("touchend", (e) => cancel(e));
    element.addEventListener("touchcancel", (e) => cancel(e));

    // Previne o menu de contexto no mobile ao segurar
    element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
  }