import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { theme } from '../config/theme';

interface DraggableAIButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export function DraggableAIButton({ onClick, isActive }: DraggableAIButtonProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const buttonWidth = 56;
      const buttonHeight = 56;

      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Keep button within viewport bounds
      newX = Math.max(0, Math.min(window.innerWidth - buttonWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - buttonHeight, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we haven't moved much (not a drag)
    if (!isDragging) {
      onClick();
    }
    e.stopPropagation();
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '56px',
        height: '56px',
        backgroundColor: isActive ? theme.colors.dominant : theme.colors.accent,
        color: isActive ? theme.colors.theme : theme.colors.dominant,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
      title="AI Assist"
    >
      <Sparkles className="size-6" />
    </button>
  );
}
