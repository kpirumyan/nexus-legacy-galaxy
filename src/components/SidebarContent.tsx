import React from 'react';
import type { GalaxySystem } from '../types';

export function SidebarContent({
  object,
}: {
  object: GalaxySystem | null;
}) {
  if (!object) {
    return (
      <div style={{ padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No Object Selected</h2>
        <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.4' }}>
          Select a star system or trading hub on the map to view its details.
        </p>
      </div>
    );
  }

  const typeLabel = object.starType ? object.starType.replace('_', ' ') : 'Unknown';
  
  return (
    <div style={{ padding: '20px', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: object.isTradingHub ? '#ffd700' : '#fff' }}>
          {object.name || 'Unknown System'}
        </h2>
        <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
          Sector {object.sectorId} • {object.visibility} Info
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Basic Info */}
        <div style={{ backgroundColor: '#151515', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>SYSTEM DETAILS</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#aaa', fontSize: '13px' }}>Type</span>
            <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{object.isTradingHub ? 'Trading Post' : typeLabel}</span>
          </div>
          
          {object.securityZone && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '13px' }}>Security</span>
              <span style={{ 
                fontSize: '13px', 
                textTransform: 'capitalize',
                color: object.securityZone === 'rift' ? '#ff4d4d' : object.securityZone === 'dead' ? '#ff9c6e' : '#52c41a'
              }}>
                {object.securityZone}
              </span>
            </div>
          )}
          
          {object.hasColonies !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '13px' }}>Colonies</span>
              <span style={{ fontSize: '13px', color: object.hasColonies ? '#52c41a' : '#ff4d4f' }}>
                {object.hasColonies ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>

        {/* Coordinates */}
        <div style={{ backgroundColor: '#151515', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>ASTROMETRICS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#aaa', fontSize: '13px', fontFamily: 'monospace' }}>X</span>
            <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{object.x?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#aaa', fontSize: '13px', fontFamily: 'monospace' }}>Y</span>
            <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{object.y?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa', fontSize: '13px', fontFamily: 'monospace' }}>Z</span>
            <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>{object.z?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
