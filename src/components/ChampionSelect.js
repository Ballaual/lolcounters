import React from 'react';
import Select from 'react-select';

function ChampionSelect({ championOptions, champion, handleChampionChange, customStyles, CustomChampionOption }) {
    return (
        <div className="form-group">
            <label>
                Enemy Champion:<span className="required">*</span>
                <Select
                    value={champion}
                    onChange={handleChampionChange}
                    options={championOptions}
                    placeholder="Select Champion"
                    styles={customStyles}
                    components={{ Option: CustomChampionOption }}
                />
            </label>
        </div>
    );
}

export default ChampionSelect;
