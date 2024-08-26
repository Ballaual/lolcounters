import React, { useState, useEffect } from 'react';

const ChangesPage = () => {
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChanges = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/changelog.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setChanges(data);
            } catch (error) {
                console.error('Fehler beim Laden der Änderungen:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChanges();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="changes-page">
            <h2>Changelog</h2>
            <ul>
                {changes.length === 0 ? (
                    <li>No changes available</li>
                ) : (
                    changes.map((change, index) => (
                        <li key={index} className="change-entry">
                            <h3>Version {change.version} - {change.date}</h3>
                            <p>{change.description}</p>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ChangesPage;
