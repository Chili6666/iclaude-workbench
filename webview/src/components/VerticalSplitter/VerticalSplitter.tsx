import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './VerticalSplitter.module.css';

interface VerticalSplitterProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * VerticalSplitter component provides a draggable divider for resizing panels.
 */
export function VerticalSplitter({
  onResize,
  minWidth = 150,
  maxWidth = 500,
}: VerticalSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    // Get the current width from the parent sidebar
    const sidebar = (e.target as HTMLElement).previousElementSibling;
    if (sidebar) {
      startWidthRef.current = sidebar.getBoundingClientRect().width;
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, onResize]);

  return (
    <div
      className={`${styles.splitter} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
}
