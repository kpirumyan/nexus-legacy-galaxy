import { STAR_CONFIGS } from './constants';
import { formatSectorDisplay, formatArmDisplay } from './utils';

export function getHoverTooltip({ object, selectedObject }: { object: any, selectedObject: any | null }) {
  if (!object) return null;
  if (selectedObject && object.id === selectedObject.id) return null;
  
  const displaySector = formatSectorDisplay(object.sectorId, object.armId);
  const displayArm = formatArmDisplay(object.armId);
  
  if (object.isTradingHub) {
    const displayName = object.name || 'Trading Post';
    const securityLabel = object.securityZone || 'sentinel';
    const securityColor = 
      securityLabel === 'rift' ? '#ff4d4d' :
      securityLabel === 'dead' ? '#ff9c6e' : '#52c41a';

    return {
      html: `
        <div style="font-family: sans-serif; padding: 10px; background: #141103; border: 1px solid #ffd700; border-radius: 6px; color: #fff; min-width: 160px; box-shadow: 0 4px 12px rgba(255,215,0,0.15);">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #ffd700;">${displayName}</div>
          <div style="font-size: 11px; color: #aaa; margin-bottom: 8px; text-transform: capitalize;">
            ${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm} • Trading Hub
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #aaa;">Security:</span>
            <span style="font-weight: bold; color: ${securityColor}; text-transform: capitalize;">${securityLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: #aaa;">Type:</span>
            <span style="font-weight: bold; color: #ffd700;">Trading Post</span>
          </div>
        </div>
      `,
      style: { backgroundColor: 'transparent', boxShadow: 'none' }
    };
  }
  
  if (object.visibility === 'fog') {
    return {
      html: `
        <div style="font-family: sans-serif; padding: 8px; background: #151515; border: 1px solid #333; border-radius: 4px; color: #fff;">
          <div style="font-weight: bold; color: #777;">Unexplored System</div>
          <div style="font-size: 11px; margin-top: 4px; color: #aaa;">${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm}</div>
          <div style="font-size: 10px; margin-top: 4px; color: #ff9800; font-style: italic;">Fog of War</div>
        </div>
      `,
      style: { backgroundColor: 'transparent', boxShadow: 'none' }
    };
  }
  
  const typeLabel = (object.starType || 'unknown').replace('_', ' ');
  const starColor = STAR_CONFIGS[object.starType]?.color || [255, 255, 255];
  const securityColor = 
    object.securityZone === 'rift' ? '#ff4d4d' :
    object.securityZone === 'dead' ? '#ff9c6e' :
    object.securityZone === 'sentinel' ? '#52c41a' : '#1890ff';
    
  return {
    html: `
      <div style="font-family: sans-serif; padding: 10px; background: #0f0f14; border: 1px solid #444; border-radius: 6px; color: #fff; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #fff;">${object.name || 'Unknown System'}</div>
        <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: capitalize;">
          ${String(object.sectorId) === '50' ? displaySector : `Sector ${displaySector}`} • ${displayArm} • ${object.visibility} info
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="color: #aaa;">Type:</span>
          <span style="font-weight: bold; color: rgb(${starColor.join(',')}); text-transform: capitalize;">${typeLabel}</span>
        </div>
        ${object.securityZone ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="color: #aaa;">Security:</span>
          <span style="font-weight: bold; color: ${securityColor}; text-transform: capitalize;">${object.securityZone}</span>
        </div>` : ''}
        ${object.hasColonies !== undefined ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: #aaa;">Colonies:</span>
          <span style="font-weight: bold; color: ${object.hasColonies ? '#52c41a' : '#ff4d4f'}">${object.hasColonies ? 'Yes' : 'No'}</span>
        </div>` : ''}
      </div>
    `,
    style: { backgroundColor: 'transparent', boxShadow: 'none' }
  };
}
