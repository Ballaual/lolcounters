import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import Cookies from 'js-cookie';
import {
    Header,
    Footer,
    ChampionSelect,
    RankSelect,
    LaneSelect,
    PatchSelect,
    YourChampionsSelect,
    CookiePopup
} from '../components';
import {
    loadThemeFromCookies,
    loadCookiePreferences,
    loadSavedValuesFromCookies,
    saveThemeToCookies,
    handleCookiesAcceptance,
    saveDataToCookies
} from '../utils/manageCookies';
import { sortData, getSortArrow } from '../utils/sortData';


// Server- und Seiten-URLs als Konstanten definieren
const SERVER_URL = 'https://ballaual.de:54321';
const PAGE_URL = 'https://lol.ballaual.de';

function Home() {
    const [champion, setChampion] = useState(null);
    const [lane, setLane] = useState('');
    const [rank, setRank] = useState('');
    const [patch, setPatch] = useState('');
    const [yourChampions, setYourChampions] = useState([]);
    const [championOptions, setChampionOptions] = useState([]);
    const [laneOptions, setLaneOptions] = useState([]);
    const [rankOptions, setRankOptions] = useState([]);
    const [patchOptions, setPatchOptions] = useState([]);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('Offline');
    const [loadedChampionName, setLoadedChampionName] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [theme, setTheme] = useState('light');
    const [showCookiePopup, setShowCookiePopup] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(Cookies.get('cookiesAccepted') === 'true');

    useEffect(() => {
        document.title = "LoL - Counterpick Analyzer";

        loadThemeFromCookies(setTheme);
        loadCookiePreferences(setCookiesAccepted, setShowCookiePopup);
        loadSavedValuesFromCookies(cookiesAccepted, setLane, setRank, setYourChampions);
    }, [cookiesAccepted]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.classList.remove(theme);
        document.body.classList.add(newTheme);

        saveThemeToCookies(newTheme, cookiesAccepted);
    };

    const handleCookiesAcceptanceWrapper = (accept) => {
        handleCookiesAcceptance(accept, setCookiesAccepted, setShowCookiePopup);
    };

    useEffect(() => {
        saveDataToCookies('yourChampions', JSON.stringify(yourChampions), cookiesAccepted);
    }, [yourChampions, cookiesAccepted]);

    useEffect(() => {
        saveDataToCookies('lane', lane, cookiesAccepted);
    }, [lane, cookiesAccepted]);

    useEffect(() => {
        saveDataToCookies('rank', rank, cookiesAccepted);
    }, [rank, cookiesAccepted]);

    const customStyles = {
        control: (styles) => ({
            ...styles,
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ccc',
        }),
        menu: (styles) => ({
            ...styles,
            backgroundColor: '#fff',
            color: '#000',
        }),
        option: (styles, { isFocused }) => ({
            ...styles,
            backgroundColor: isFocused ? '#e0e0e0' : '#fff',
            color: '#000',
        }),
        multiValueRemove: (styles, { isFocused }) => ({
            ...styles,
            color: '#000',
            ':hover': {
                backgroundColor: isFocused ? '#ccc' : undefined,
                color: '#000',
            },
        }),
    };

    const CustomChampionOption = ({ data, innerRef, innerProps, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                backgroundColor: isFocused ? '#e0e0e0' : '#fff',
                cursor: 'pointer'
            }}
        >
            <img
                src={`${process.env.PUBLIC_URL}/champions/${data.value.toLowerCase()}.webp`}
                alt={data.label}
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    marginLeft: '4px'
                }}
            />
            <span>{data.label}</span>
        </div>
    );

    const CustomRankOption = ({ data, innerRef, innerProps, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                backgroundColor: isFocused ? '#e0e0e0' : '#fff',
                cursor: 'pointer'
            }}
        >
            <img
                src={`${process.env.PUBLIC_URL}/ranks/${data.apiName2.toLowerCase()}.webp`}
                alt={data.label}
                style={{
                    width: '32px',
                    height: '32px',
                    marginRight: '8px',
                    marginLeft: '4px'
                }}
            />
            <span>{data.label}</span>
        </div>
    );

    const CustomLaneOption = ({ data, innerRef, innerProps, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                backgroundColor: isFocused ? '#e0e0e0' : '#fff',
                cursor: 'pointer'
            }}
        >
            <img
                src={`${process.env.PUBLIC_URL}/lanes/${data.value.toLowerCase()}.webp`}
                alt={data.label}
                style={{
                    width: '32px',
                    height: '32px',
                    marginRight: '8px',
                    marginLeft: '4px'
                }}
            />
            <span>{data.label}</span>
        </div>
    );

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const championRes = await fetch(`${PAGE_URL}/champions.json`);
                const champions = await championRes.json();
                setChampionOptions(champions.map(champ => ({ label: champ.displayName, value: champ.apiName, role: champ.role })));

                const laneRes = await fetch(`${PAGE_URL}/lanes.json`);
                const lanes = await laneRes.json();
                setLaneOptions(lanes.map(lane => ({ label: lane.displayName, value: lane.apiName })));

                const rankRes = await fetch(`${PAGE_URL}/ranks.json`);
                const ranks = await rankRes.json();
                setRankOptions(ranks.map(rank => ({ label: rank.displayName, value: rank.apiName2, apiName2: rank.apiName2 })));

                const patchRes = await fetch(`${PAGE_URL}/patches.json`);
                const patches = await patchRes.json();
                setPatchOptions(patches.map(patch => ({ label: patch, value: patch })));

                if (patches.length > 0) {
                    setPatch(patches[patches.length - 1]);
                }
            } catch (error) {
                console.error('Error loading options:', error);
            }
        };

        const checkServerStatus = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/status`);
                if (response.ok) {
                    setServerStatus('Online');
                } else {
                    setServerStatus('Offline');
                }
            } catch (error) {
                setServerStatus('Offline');
            }
        };

        loadOptions();
        checkServerStatus();

        const interval = setInterval(checkServerStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${SERVER_URL}/fetch-data?champion=${champion.value}&lane=${lane}&tier=${rank}&vslane=${lane}&patch=${patch}`);
            const result = await response.json();
            if (result.length === 0) {
                setData([]);
                setFilteredData([]);
            } else {
                const processedData = result.map(row => {
                    const championMatch = championOptions.find(champ => champ.label === row.championName);
                    if (championMatch) {
                        row.apiName = championMatch.value;
                    }
                    return row;
                });
                setData(processedData);
                setFilteredData(processedData);
                setLoadedChampionName(champion.label);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (yourChampions.length > 0) {
            const filtered = data.filter((row) =>
                yourChampions.some((champion) => champion.label === row.championName)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    }, [yourChampions, data]);

    const handleChampionChange = (selectedChampion) => {
        setChampion(selectedChampion);
    };

    const isFormComplete = champion && lane && rank && patch;

    const renderChampionTableCell = (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleChampionClick(row.apiName)}>
            <img
                src={`${process.env.PUBLIC_URL}/champions/${row.apiName.toLowerCase()}.webp`}
                alt={row.championName}
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginRight: '8px'
                }}
            />
            {row.championName}
        </span>
    );

    const handleChampionClick = (apiName) => {
        if (champion && lane && rank && patch) {
            const url = `https://lolalytics.com/lol/${apiName}/vs/${champion.value}/build/?lane=${lane}&tier=${rank}&vslane=${lane}&patch=${patch}`;
            window.open(url, '_blank');
        }
    };

    const applySort = (key) => {
        const { sortedData, newConfig } = sortData(key, filteredData, sortConfig);
        setFilteredData(sortedData);
        setSortConfig(newConfig);
    };

    return (
        <div className={`app ${theme}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <div className="main-content">
                <div className="form-container">
                    <h2>Analyzing</h2>
                    <div className="form-row">
                        <ChampionSelect
                            championOptions={championOptions}
                            champion={champion}
                            handleChampionChange={handleChampionChange}
                            customStyles={customStyles}
                            CustomChampionOption={CustomChampionOption}
                        />

                        <LaneSelect
                            laneOptions={laneOptions}
                            lane={lane}
                            setLane={setLane}
                            customStyles={customStyles}
                            CustomLaneOption={CustomLaneOption}
                        />

                        <RankSelect
                            rankOptions={rankOptions}
                            rank={rank}
                            setRank={setRank}
                            customStyles={customStyles}
                            CustomRankOption={CustomRankOption}
                        />

                        <PatchSelect
                            patchOptions={patchOptions}
                            patch={patch}
                            setPatch={setPatch}
                            customStyles={customStyles}
                        />
                    </div>
                    <div className="form-row second-row">
                        <YourChampionsSelect
                            yourChampions={yourChampions}
                            setYourChampions={setYourChampions}
                            championOptions={championOptions}
                            customStyles={customStyles}
                            CustomChampionOption={CustomChampionOption}
                        />
                    </div>
                    <div className="form-row third-row">
                        <button onClick={fetchData} disabled={!isFormComplete || loading} className="btn search-btn">
                            {loading ? (
                                <div className="loading-animation">
                                    <div className="spinner"></div>
                                </div>
                            ) : 'Search'}
                        </button>
                        <div className="status-container">
                            Backend:<div className={`server-status ${serverStatus.toLowerCase()}`}>
                                {serverStatus}
                            </div>
                        </div>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => applySort('championName')}>
                                Champion {getSortArrow('championName', sortConfig)}
                            </th>
                            <th onClick={() => applySort('winRateVs')}>
                                {loadedChampionName ? `WR vs ${loadedChampionName}` : "WR vs"} (%) {getSortArrow('winRateVs', sortConfig)}
                            </th>
                            <th onClick={() => applySort('allChampsWinRate')}>Champ WR (%) {getSortArrow('allChampsWinRate', sortConfig)}</th>
                            <th onClick={() => applySort('gamesCount')}>Matches (&gt;100) {getSortArrow('gamesCount', sortConfig)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, index) => (
                            <tr key={index}>
                                <td>
                                    {row.apiName ? (
                                        renderChampionTableCell(row)
                                    ) : (
                                        <span>{row.championName}</span>
                                    )}
                                </td>
                                <td>{row.winRateVs}</td>
                                <td>{row.allChampsWinRate}</td>
                                <td>{row.gamesCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Footer onCookieClick={() => setShowCookiePopup(true)} />

            <CookiePopup
                show={showCookiePopup}
                onAccept={() => handleCookiesAcceptanceWrapper(true)}
                onDecline={() => handleCookiesAcceptanceWrapper(false)}
                onClose={() => setShowCookiePopup(false)}
            />
        </div>
    );
}

export default Home;
