import React from 'react';
import Select from 'react-select';

function LaneSelect({ laneOptions, lane, setLane, customStyles, CustomLaneOption }) {
    return (
        <div className="form-group">
            <label>
                Lane:<span className="required">*</span>
                <Select
                    value={laneOptions.find(option => option.value === lane)}
                    onChange={option => setLane(option ? option.value : '')}
                    options={laneOptions}
                    placeholder="Select Lane"
                    styles={customStyles}
                    components={{ Option: CustomLaneOption }}
                />
            </label>
        </div>
    );
}

export default LaneSelect;
