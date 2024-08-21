import React from 'react';
import Select from 'react-select';

function RankSelect({ rankOptions, rank, setRank, customStyles, CustomRankOption }) {
    return (
        <div className="form-group">
            <label>
                Rank:<span className="required">*</span>
                <Select
                    value={rankOptions.find(option => option.value === rank)}
                    onChange={option => setRank(option ? option.value : '')}
                    options={rankOptions}
                    placeholder="Select Rank"
                    styles={customStyles}
                    components={{ Option: CustomRankOption }}
                />
            </label>
        </div>
    );
}

export default RankSelect;
