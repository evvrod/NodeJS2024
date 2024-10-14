import os from 'os';

const getEOL = () => {
    try {
        const eol = JSON.stringify(os.EOL);
        console.log(`End of Line (EOL) is: ${eol}`);
    } catch (error) {
        throw Error(error.message);
    }
};

const getCPUs = () => {
    try {
        const cpus = os.cpus();
        console.log(`Number of CPUs: ${cpus.length}`);
        cpus.forEach((cpu, index) => {
            console.log(`CPU ${index + 1}: ${cpu.model}, Speed: ${cpu.speed / 1000} GHz`);
        });
    } catch (error) {
        throw Error(error.message);
    }
};

const getHomeDir = () => {
    try {
        const homedir = os.homedir();
        console.log(`Home Directory: ${homedir}`);
    } catch (error) {
        throw Error(error.message);
    }
};

const getUsername = () => {
    try {
        const userInfo = os.userInfo();
        console.log(`System Username: ${userInfo.username}`);
    } catch (error) {
        throw Error(error.message);
    }
};

const getArchitecture = () => {
    try {
        const architecture = os.arch();
        console.log(`CPU Architecture: ${architecture}`);
    } catch (error) {
        throw Error(error.message);
    }
};

export default function osInfo(arg) {
    switch (arg) {
        case '--EOL':
            getEOL();
            break;
        case '--cpus':
            getCPUs();
            break;
        case '--homedir':
            getHomeDir();
            break;
        case '--username':
            getUsername();
            break;
        case '--architecture':
            getArchitecture();
            break
        default:
            throw Error('Invalid input');
    }
};