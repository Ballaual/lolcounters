import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './App.css';
import { Header, Footer, ChampionSelect, RankSelect, LaneSelect, PatchSelect, YourChampionsSelect } from './components';

// Server- und Seiten-URLs als Konstanten definieren
const SERVER_URL = 'https://ballaual.de:54321';
const PAGE_URL = 'https://lol.ballaual.de';

function App() {
  // State-Variablen zur Verwaltung der Formulareingaben und UI-Status
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

  // Initiales Laden von Theme, Cookies und gespeicherten Werten
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
          console.error('Fehler beim Parsen der Champions aus Cookies:', e);
        }
      }
    }
  }, [cookiesAccepted]);

  // Theme umschalten und speichern, wenn Cookies akzeptiert wurden
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.remove(theme);
    document.body.classList.add(newTheme);

    if (cookiesAccepted) {
      Cookies.set('theme', newTheme, { expires: 7 });
    }
  };

  // Optionen für Champion, Lane, Rang und Patch laden
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
        console.error('Fehler beim Laden der Optionen:', error);
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

    // Regelmäßige Überprüfung des Serverstatus
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Champions, Lane und Rang in Cookies speichern, wenn akzeptiert
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

  // Daten vom Server abrufen
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
      console.error('Fehler beim Abrufen der Daten:', error);
    }

    setLoading(false);
  };

  // Filtern der Daten basierend auf den ausgewählten Champions
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

  // Champion ändern
  const handleChampionChange = (selectedChampion) => {
    setChampion(selectedChampion);
  };

  // Überprüfen, ob das Formular vollständig ist
  const isFormComplete = champion && lane && rank && patch;

  // Daten sortieren
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

  // Sortierpfeile anzeigen
  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Cookie-Akzeptanz verarbeiten
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

  // Benutzerdefinierte Styles für das Select-Menü
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

  // Benutzerdefinierte Option-Komponenten für Select-Menüs
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

  // Champion-Tabelle rendern und interaktiv gestalten
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

  // Champion-Daten zur Analyse anzeigen
  const handleChampionClick = (apiName) => {
    if (champion && lane && rank && patch) {
      const url = `https://lolalytics.com/lol/${apiName}/vs/${champion.value}/build/?lane=${lane}&tier=${rank}&vslane=${lane}&patch=${patch}`;
      window.open(url, '_blank');
    }
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
              handleChampionChange={setChampion}
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

      <Footer />

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
