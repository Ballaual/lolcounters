import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Cookies from 'js-cookie';
import './App.css';

const SERVER_URL = 'https://ballaual.de:54321';
const PAGE_URL = 'https://lol.ballaual.de';

function App() {
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
  const [processingStatus, setProcessingStatus] = useState({ isProcessing: false, progress: 0, message: '' });
  const [showProcessingStatus, setShowProcessingStatus] = useState(false);
  const [hasDataBeenFetched, setHasDataBeenFetched] = useState(false);
  const [loadedChampionName, setLoadedChampionName] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [theme, setTheme] = useState('light');
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(Cookies.get('cookiesAccepted') === 'true');

  useEffect(() => {
    document.title = "LoL - Counterpick Analyzer";

    const savedTheme = Cookies.get('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
    }

    if (Cookies.get('cookiesPopupShown')) {
      setCookiesAccepted(Cookies.get('cookiesAccepted') === 'true');
    } else {
      setShowCookiePopup(true);
    }

    if (cookiesAccepted) {
      const savedLane = Cookies.get('lane');
      const savedRank = Cookies.get('rank');
      const savedChampions = Cookies.get('yourChampions');

      if (savedLane) setLane(savedLane);
      if (savedRank) setRank(savedRank);
      if (savedChampions) {
        try {
          const parsedChampions = JSON.parse(savedChampions);
          setYourChampions(parsedChampions);
        } catch (e) {
          console.error('Error parsing champions from cookie:', e);
        }
      }
    }
  }, [cookiesAccepted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.remove(theme);
    document.body.classList.add(newTheme);
    if (cookiesAccepted) {
      Cookies.set('theme', newTheme, { expires: 7 });
    }
  };

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

  useEffect(() => {
    if (cookiesAccepted) {
      if (yourChampions.length > 0) {
        Cookies.set('yourChampions', JSON.stringify(yourChampions), { expires: 7, secure: true, sameSite: 'Strict' });
      } else {
        Cookies.remove('yourChampions');
      }
    }
  }, [yourChampions, cookiesAccepted]);

  useEffect(() => {
    if (lane && cookiesAccepted) {
      Cookies.set('lane', lane, { expires: 7, secure: true, sameSite: 'Strict' });
    } else if (!cookiesAccepted) {
      Cookies.remove('lane');
    }
  }, [lane, cookiesAccepted]);

  useEffect(() => {
    if (rank && cookiesAccepted) {
      Cookies.set('rank', rank, { expires: 7, secure: true, sameSite: 'Strict' });
    } else if (!cookiesAccepted) {
      Cookies.remove('rank');
    }
  }, [rank, cookiesAccepted]);

  const startProcessingStatusPolling = () => {
    setShowProcessingStatus(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${SERVER_URL}/processing-status`);
        const status = await response.json();
        setProcessingStatus(status);

        if (!status.isProcessing) {
          setShowProcessingStatus(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking processing status:', error);
      }
    }, 250);

    return () => clearInterval(interval);
  };

  const fetchData = async () => {
    setLoading(true);
    setHasDataBeenFetched(true);
    startProcessingStatusPolling();

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
    setShowProcessingStatus(false);
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

  const getNoDataMessageClass = () => {
    if (hasDataBeenFetched && filteredData.length === 0) {
      return 'no-data-error';
    }
    return 'no-data';
  };

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const handleCookiesAcceptance = (accept) => {
    setCookiesAccepted(accept);
    setShowCookiePopup(false);

    Cookies.set('cookiesPopupShown', 'true', { expires: 30 });

    if (accept) {
      Cookies.set('cookiesAccepted', 'true', { expires: 30 });
    } else {
      Cookies.remove('cookiesAccepted');
      Cookies.remove('theme');
      Cookies.remove('lane');
      Cookies.remove('rank');
      Cookies.remove('yourChampions');
    }
  };

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
        src={`https://cdn5.lolalytics.com/champx92/${data.value.toLowerCase()}.webp`}
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
        src={`https://cdn5.lolalytics.com/emblem80/${data.apiName2.toLowerCase()}.webp`}
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
        src={`https://cdn5.lolalytics.com/lane54/${data.value.toLowerCase()}.webp`}
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

  const renderChampionTableCell = (row) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleChampionClick(row.apiName)}>
      <img
        src={`https://cdn5.lolalytics.com/champx92/${row.apiName.toLowerCase()}.webp`}
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

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <div className="logo"></div>
        <span className="header-title">Counterpick Analyzer</span>
        <div className="theme-switcher">
          <label>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</label>
          <label className="switch">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
        </div>
      </header>

      <div className="main-content">
        <div className="form-container">
          <h2>Analyzing</h2>
          <div className="form-row">
            <div className="form-group">
              <label>
                Enemy Champion:<span className="required">*</span>
                <Select value={champion} onChange={handleChampionChange} options={championOptions} placeholder="Select Champion" styles={customStyles} components={{ Option: CustomChampionOption }} />
              </label>
            </div>
            <div className="form-group">
              <label>
                Lane:<span className="required">*</span>
                <Select value={laneOptions.find(option => option.value === lane)} onChange={option => setLane(option ? option.value : '')} options={laneOptions} placeholder="Select Lane" styles={customStyles} components={{ Option: CustomLaneOption }} />
              </label>
            </div>
            <div className="form-group">
              <label>
                Rank:<span className="required">*</span>
                <Select value={rankOptions.find(option => option.value === rank)} onChange={option => setRank(option ? option.value : '')} options={rankOptions} placeholder="Select Rank" styles={customStyles} components={{ Option: CustomRankOption }} />
              </label>
            </div>
            <div className="form-group">
              <label>
                Patch:<span className="required">*</span>
                <Select value={patchOptions.find(option => option.value === patch)} onChange={option => setPatch(option ? option.value : '')} options={patchOptions} placeholder="Select Patch" styles={customStyles} />
              </label>
            </div>
          </div>
          <div className="form-row second-row">
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
              {showProcessingStatus && (
                <div className="processing-status">
                  {processingStatus.message} ({processingStatus.progress}%)
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('championName')}>
                Champion {getSortArrow('championName')}
              </th>
              <th onClick={() => sortData('winRateVs')}>
                {loadedChampionName ? `WR vs ${loadedChampionName}` : "WR vs"} (%) {getSortArrow('winRateVs')}
              </th>
              <th onClick={() => sortData('allChampsWinRate')}>Champ WR (%) {getSortArrow('allChampsWinRate')}</th>
              <th onClick={() => sortData('gamesCount')}>Matches (&gt;100) {getSortArrow('gamesCount')}</th>
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

      <footer className="footer">
        Idea by Justdom | Made by Ballaual | v. 1.1.5
      </footer>

      <img
        src={`${process.env.PUBLIC_URL}/cookies.png`}
        alt="Cookie Settings"
        className="cookie-button"
        onClick={() => setShowCookiePopup(true)}
        width={32}
        height={32}
      />

      {showCookiePopup && (
        <div className="cookie-popup">
          <div className="cookie-popup-content">
            <button className="close-popup" onClick={() => setShowCookiePopup(false)}>×</button>
            <h2>Cookie Settings</h2>
            <p>Do you accept cookies for improved user experience?</p>
            <button className="btn accept" onClick={() => handleCookiesAcceptance(true)}>Accept</button>
            <button className="btn decline" onClick={() => handleCookiesAcceptance(false)}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
