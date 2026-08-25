import { CSSProperties, ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import "../../styles/components/common/modal.scss";

export type CommonModalSize = "sm" | "md" | "lg" | "xl" | "full";

type CommonModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  size?: CommonModalSize;
  width?: number | string;
  panelClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
};

const modalWidths: Record<CommonModalSize, string> = {
  sm: "560px",
  md: "880px",
  lg: "1200px",
  xl: "1576px",
  full: "calc(100vw - 48px)",
};

export default function CommonModal({
  open,
  onClose,
  children,
  title,
  header,
  footer,
  size = "md",
  width,
  panelClassName = "",
  contentClassName = "",
  ariaLabel,
  closeLabel = "닫기",
  closeOnBackdrop = true,
  showCloseButton = true,
}: CommonModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const modalWidth = typeof width === "number" ? `${width}px` : width ?? modalWidths[size];
  const panelStyle: CSSProperties = {
    width: modalWidth,
    maxWidth: "calc(100vw - 48px)",
  };

  return createPortal(
    <div
      className="common-modal"
      role="dialog"
      aria-modal="true"
      aria-label={!title ? ariaLabel : undefined}
      aria-labelledby={title ? titleId : undefined}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`common-modal__panel ${panelClassName}`} style={panelStyle}>
        {(title || header || showCloseButton) && (
          <header className="common-modal__header">
            <div className="common-modal__heading">
              {title && <h2 id={titleId}>{title}</h2>}
              {header}
            </div>
            {showCloseButton && (
              <button ref={closeButtonRef} type="button" aria-label={closeLabel} onClick={onClose}>×</button>
            )}
          </header>
        )}
        <div className={`common-modal__content ${contentClassName}`}>{children}</div>
        {footer && <footer className="common-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
