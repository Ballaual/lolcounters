export const sortData = (key, dataSet, config) => {
    let direction = 'ascending';
    if (config.key === key && config.direction === 'ascending') {
        direction = 'descending';
    }

    const sortedData = [...dataSet].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0;
    });

    return { sortedData, newConfig: { key, direction } };
};

export const getSortArrow = (key, config) => {
    if (config.key === key) {
        return config.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
};
