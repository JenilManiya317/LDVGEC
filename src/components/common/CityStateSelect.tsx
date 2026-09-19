import React, { useMemo } from 'react';
import { MapPin, Building2 } from 'lucide-react';
import { INDIAN_STATES_AND_DISTRICTS, ALL_STATE_NAMES, getDistrictsForState, parseLocationString } from '../../lib/geo-data';

export interface CityStateSelectProps {
  /** Combined location string, e.g. "Surat, Gujarat" */
  value?: string;
  onChange?: (combinedLocation: string) => void;

  /** Separate controlled values */
  selectedState?: string;
  selectedDistrict?: string;
  onStateChange?: (state: string) => void;
  onDistrictChange?: (district: string) => void;

  stateLabel?: string;
  districtLabel?: string;
  layout?: 'grid' | 'stacked' | 'row-inline';
  showLabels?: boolean;
  showIcons?: boolean;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
}

export const CityStateSelect: React.FC<CityStateSelectProps> = ({
  value,
  onChange,
  selectedState: propState,
  selectedDistrict: propDistrict,
  onStateChange,
  onDistrictChange,
  stateLabel = 'State / Region',
  districtLabel = 'City / District',
  layout = 'grid',
  showLabels = true,
  showIcons = true,
  className = '',
  selectClassName = '',
  disabled = false,
}) => {
  // If controlled via combined value
  const parsed = useMemo(() => {
    if (value !== undefined) {
      return parseLocationString(value);
    }
    return { state: propState || 'Gujarat', district: propDistrict || 'Surat' };
  }, [value, propState, propDistrict]);

  const currentState = propState !== undefined ? propState : parsed.state;
  const currentDistrict = propDistrict !== undefined ? propDistrict : parsed.district;

  // Available districts for the currently selected state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(currentState);
  }, [currentState]);

  const handleStateSelect = (newState: string) => {
    const districts = getDistrictsForState(newState);
    const newDistrict = districts.includes(currentDistrict) ? currentDistrict : districts[0] || '';

    if (onStateChange) onStateChange(newState);
    if (onDistrictChange) onDistrictChange(newDistrict);
    if (onChange) onChange(`${newDistrict}, ${newState}`);
  };

  const handleDistrictSelect = (newDistrict: string) => {
    if (onDistrictChange) onDistrictChange(newDistrict);
    if (onChange) onChange(`${newDistrict}, ${currentState}`);
  };

  const layoutClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    stacked: 'space-y-3',
    'row-inline': 'flex flex-wrap items-center gap-2',
  }[layout];

  const defaultSelectStyle =
    'w-full glass-input rounded-xl py-2.5 text-xs font-bold text-white bg-slate-900/90 border border-white/20 focus:border-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={`${layoutClasses} ${className}`}>
      {/* State Selector */}
      <div className={layout === 'row-inline' ? 'flex-1 min-w-[140px]' : 'w-full'}>
        {showLabels && (
          <label className="block text-[11px] font-bold text-white/85 mb-1 tracking-wide flex items-center gap-1.5">
            {showIcons && <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            <span>{stateLabel}</span>
          </label>
        )}
        <div className="relative">
          {showIcons && !showLabels && (
            <Building2 className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <select
            value={currentState}
            disabled={disabled}
            onChange={(e) => handleStateSelect(e.target.value)}
            className={`${defaultSelectStyle} ${showIcons && !showLabels ? 'pl-9 pr-3' : 'px-3'} ${selectClassName}`}
          >
            {ALL_STATE_NAMES.map((state) => (
              <option key={state} value={state} className="bg-slate-900 text-white font-medium py-1">
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* District / City Selector */}
      <div className={layout === 'row-inline' ? 'flex-1 min-w-[140px]' : 'w-full'}>
        {showLabels && (
          <label className="block text-[11px] font-bold text-white/85 mb-1 tracking-wide flex items-center gap-1.5">
            {showIcons && <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span>{districtLabel}</span>
          </label>
        )}
        <div className="relative">
          {showIcons && !showLabels && (
            <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <select
            value={currentDistrict}
            disabled={disabled}
            onChange={(e) => handleDistrictSelect(e.target.value)}
            className={`${defaultSelectStyle} ${showIcons && !showLabels ? 'pl-9 pr-3' : 'px-3'} ${selectClassName}`}
          >
            {availableDistricts.map((district) => (
              <option key={district} value={district} className="bg-slate-900 text-white font-medium py-1">
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
