import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface SidebarLayoutProps {
  children: ReactNode;
  sidebarContent: ReactNode;
}

export function SidebarLayout({ children, sidebarContent }: SidebarLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
      
      {/* Resizer Handle */}
      <div 
        onMouseDown={(e) => {
          e.preventDefault();
          isResizing.current = true;
          document.body.style.cursor = 'col-resize';
        }}
        style={{
          width: '4px',
          cursor: 'col-resize',
          backgroundColor: '#222',
          zIndex: 50,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#222'}
      />
      
      {/* Sidebar Content */}
      <div style={{ 
        width: sidebarWidth, 
        height: '100%', 
        backgroundColor: '#0a0a0a', 
        borderLeft: '1px solid #111',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {sidebarContent}
      </div>
    </div>
  );
}
