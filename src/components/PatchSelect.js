import React from 'react';
import Select from 'react-select';

function PatchSelect({ patchOptions, patch, setPatch, customStyles }) {
    return (
        <div className="form-group">
            <label>
                Patch:<span className="required">*</span>
                <Select
                    value={patchOptions.find(option => option.value === patch)}
                    onChange={option => setPatch(option ? option.value : '')}
                    options={patchOptions}
                    placeholder="Select Patch"
                    styles={customStyles}
                />
            </label>
        </div>
    );
}

export default PatchSelect;
