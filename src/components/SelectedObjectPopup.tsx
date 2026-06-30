import { X } from 'lucide-react';
import { STAR_CONFIGS } from '../lib/constants';
import { formatSectorDisplay, formatArmDisplay } from '../lib/utils';

interface Props {
  selectedObject: any;
  pos: { x: number, y: number };
  onClose: () => void;
}

export function SelectedObjectPopup({ selectedObject, pos, onClose }: Props) {
  const displaySector = formatSectorDisplay(selectedObject.sectorId, selectedObject.armId);
  const displayArm = formatArmDisplay(selectedObject.armId);
  
  let content;
  if (selectedObject.isTradingHub) {
    const displayName = selectedObject.name || 'Trading Post';
    const securityLabel = selectedObject.securityZone || 'sentinel';
    const securityColor = 
      securityLabel === 'rift' ? '#ff4d4d' :
      securityLabel === 'dead' ? '#ff9c6e' : '#52c41a';
      
    content = (
      <div style={{
        fontFamily: 'sans-serif',
        padding: '12px',
        background: '#141103',
        border: '2px solid #ffd700',
        borderRadius: '8px',
        color: '#fff',
        minWidth: '200px',
        boxShadow: '0 4px 20px rgba(255,215,0,0.25)',
        position: 'relative',
      }}>
        <CloseButton onClick={onClose} color="#ffd700" hoverBg="rgba(255,215,0,0.15)" />
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#ffd700', paddingRight: '20px' }}>
          {displayName}
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'capitalize' }}>
          {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm} • Trading Hub
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: '#aaa' }}>Security:</span>
          <span style={{ fontWeight: 'bold', color: securityColor, textTransform: 'capitalize' }}>{securityLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#aaa' }}>Type:</span>
          <span style={{ fontWeight: 'bold', color: '#ffd700' }}>Trading Post</span>
        </div>
      </div>
    );
  } else if (selectedObject.visibility === 'fog') {
    content = (
      <div style={{
        fontFamily: 'sans-serif',
        padding: '12px',
        background: '#151515',
        border: '2px solid #555',
        borderRadius: '8px',
        color: '#fff',
        minWidth: '200px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        <CloseButton onClick={onClose} color="#aaa" hoverBg="rgba(255,255,255,0.1)" />
        <div style={{ fontWeight: 'bold', color: '#777', paddingRight: '20px' }}>Unexplored System</div>
        <div style={{ fontSize: '11px', marginTop: '4px', color: '#aaa' }}>
          {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm}
        </div>
        <div style={{ fontSize: '10px', marginTop: '4px', color: '#ff9800', fontStyle: 'italic' }}>Fog of War</div>
      </div>
    );
  } else {
    const typeLabel = (selectedObject.starType || 'unknown').replace('_', ' ');
    const starColor = STAR_CONFIGS[selectedObject.starType]?.color || [255, 255, 255];
    const securityColor = 
      selectedObject.securityZone === 'rift' ? '#ff4d4d' :
      selectedObject.securityZone === 'dead' ? '#ff9c6e' :
      selectedObject.securityZone === 'sentinel' ? '#52c41a' : '#1890ff';
      
    content = (
      <div style={{
        fontFamily: 'sans-serif',
        padding: '12px',
        background: '#0f0f14',
        border: '2px solid #555',
        borderRadius: '8px',
        color: '#fff',
        minWidth: '200px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        <CloseButton onClick={onClose} color="#aaa" hoverBg="rgba(255,255,255,0.1)" />
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#fff', paddingRight: '20px' }}>
          {selectedObject.name || 'Unknown System'}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'capitalize' }}>
          {String(selectedObject.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • {displayArm} • {selectedObject.visibility} info
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: '#aaa' }}>Type:</span>
          <span style={{ fontWeight: 'bold', color: `rgb(${starColor.join(',')})`, textTransform: 'capitalize' }}>{typeLabel}</span>
        </div>
        {selectedObject.securityZone && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#aaa' }}>Security:</span>
            <span style={{ fontWeight: 'bold', color: securityColor, textTransform: 'capitalize' }}>{selectedObject.securityZone}</span>
          </div>
        )}
        {selectedObject.hasColonies !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#aaa' }}>Colonies:</span>
            <span style={{ fontWeight: 'bold', color: selectedObject.hasColonies ? '#52c41a' : '#ff4d4f' }}>{selectedObject.hasColonies ? 'Yes' : 'No'}</span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'absolute',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      transform: 'translate(-50%, -105%)',
      pointerEvents: 'auto',
      zIndex: 1000,
    }}>
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: '16px',
        height: '16px',
        background: selectedObject.isTradingHub ? '#141103' : (selectedObject.visibility === 'fog' ? '#151515' : '#0f0f14'),
        borderBottom: `2px solid ${selectedObject.isTradingHub ? '#ffd700' : '#555'}`,
        borderRight: `2px solid ${selectedObject.isTradingHub ? '#ffd700' : '#555'}`,
        zIndex: -1,
      }} />
      {content}
    </div>
  );
}

function CloseButton({ onClick, color, hoverBg }: { onClick: () => void, color: string, hoverBg: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'transparent',
        border: 'none',
        color,
        cursor: 'pointer',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <X size={14} />
    </button>
  );
}
