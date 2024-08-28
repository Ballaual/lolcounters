const { execSync } = require('child_process');

try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

    console.log(`Using commit: ${commitHash}, branch: ${branchName}`);

    process.env.REACT_APP_GIT_COMMIT = commitHash;
    process.env.REACT_APP_GIT_BRANCH = branchName;

    require('react-scripts/scripts/build');
} catch (error) {
    console.error('Error fetching git information', error);
    process.exit(1);
}
