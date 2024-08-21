import React from 'react';
import Select from 'react-select';

function YourChampionsSelect({ yourChampions, setYourChampions, championOptions, customStyles, CustomChampionOption }) {
    return (
        <div className="form-group your-champs">
            <label>
                Your Champions:
                <Select
                    isMulti
                    value={yourChampions}
                    onChange={setYourChampions}
                    options={championOptions}
                    placeholder="Select Your Champions"
                    styles={customStyles}
                    components={{ Option: CustomChampionOption }}
                />
            </label>
        </div>
    );
}

export default YourChampionsSelect;
