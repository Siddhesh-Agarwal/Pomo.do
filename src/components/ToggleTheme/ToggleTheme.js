import './ToggleTheme.css';
import React, { memo } from 'react';

const ToggleTheme = ({ theme, setTheme }) => {
    const handleChange = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="ToggleTheme">
            {/* button for switch  */}
            <button onClick={handleChange}>
                {theme === 'light' ? <i class="fa fa-moon"></i> : <i class="fa fa-sun"></i>}
            </button>
            <span className="slider round" />
        </div>
    );
}

export default memo(ToggleTheme);