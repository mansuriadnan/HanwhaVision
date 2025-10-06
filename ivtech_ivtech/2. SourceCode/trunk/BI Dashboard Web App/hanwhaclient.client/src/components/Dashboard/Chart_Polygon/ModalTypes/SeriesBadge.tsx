import { Box } from '@mui/material';
import { SeriesBadgeProps } from '../../../../interfaces/IChart';
import React from 'react';


const SeriesBadge: React.FC<SeriesBadgeProps> = ({
    label,
    value,
    gradientColors,
    Pwidth = 160,
    Pheight = 50,
}) => {
    const width = parseInt(Pwidth as string, 10) /6 + 20   || 160;
    const height = parseInt(Pheight as string, 10) /6 || 50;
    const borderRadius = height / 2;

    const fontSizeScale = Math.max(parseInt(Pheight as string, 10), 100) * 0.050;
    const outerStyle: React.CSSProperties = {
       
        background: `linear-gradient(to right, ${gradientColors}, #fff)`,
        // fontSize: (height-40)* 1.5,
       
    };
    const dashedWrapperStyle: React.CSSProperties = {
       
    };
    
    return (
        <div style={dashedWrapperStyle} className="modal-types-box">
          <div className="modal-types-box-inner" style={outerStyle}>
                <span>{label}</span>
                <strong>
                    {value}
                </strong>
            </div>
        </div>
    );
};

export { SeriesBadge };

