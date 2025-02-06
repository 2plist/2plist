import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = 'data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}
export async function fetchChangelog() {
    try {
        const changelogResults = await fetch(`${dir}/_changelog.json`);
        const changelog = await changelogResults.json();
        changelog.forEach((entry) => {
            const [day, month, year] = entry.date.split('-').map(Number);
            entry.dateObject = new Date(year, month - 1, day);
        });
        
        changelog.sort((a, b) => b.dateObject - a.dateObject);
        
        changelog.forEach((entry) => {
            entry.date = entry.dateObject.toLocaleDateString();
            delete entry.dateObject;
        });
        return changelog;
    } catch {
        return null;
    }
}
export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verificationVid,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent == 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}
export async function fetchThemes() {
    try {
        const response = await fetch(`${dir}/_themes.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const themes = await response.json();
        return themes.slice(1);
    } catch (error) {
        console.error('Failed to fetch themes:', error);
        return [];
    }
}
export function changeTheme(themeStyles) {
    try {
        if (themeStyles) {
            Object.keys(themeStyles).forEach(key => {
                if (key !== 'name') {
                    document.documentElement.style.setProperty(`--${key}`, themeStyles[key]);
                }
            });

            // Replace images if the theme includes them
            if (themeStyles.logo) {
                if (themeStyles.logo.includes('http')) {
                    document.getElementById('logo').src = themeStyles.logo;
                }
                else{
                document.getElementById('logo').src = `assets/themes/${themeStyles.logo}`;
                }
            }
            if (themeStyles.discord) {
                if (themeStyles.discord.includes('http')) {
                    document.getElementById('discord').src = themeStyles.discord;
                }
                else{
                document.getElementById('discord').src = `assets/themes/${themeStyles.discord}`;
                }
            }
            if (themeStyles.theme) {
                if (themeStyles.theme.includes('http')) {
                    document.getElementById('theme').src = themeStyles.theme;
                }
                else{
                document.getElementById('theme').src = `assets/themes/${themeStyles.theme}`;
                }
            }

            localStorage.setItem('currentTheme', JSON.stringify(themeStyles));
        }
    } catch (error) {
        console.error(`Failed to apply theme: ${error}`);
    }
}

export function secretTheme() {
    let secret = 'buhislife';
    let input = '';
    let theme = localStorage.getItem('currentTheme');
    const wrapper = document.querySelector('.wrapper-theme:has(.theme-container)');
    document.addEventListener('keydown', (event) => {
        input += event.key;
        if  (event.key === 'Escape') {
            input = '';
        }
        if (input === secret) {
            if (theme){
                theme = JSON.parse(theme);
                theme.name = 'Buh';
                theme.logo = 'https://cdn.7tv.app/emote/01H4945CB0000ESPTK3C1A5RVR/4x.avif';
                theme.discord = 'https://cdn.7tv.app/emote/01GZYJWZ6R000D81ZGQH0KPFRP/4x.avif';
                theme.theme = 'https://cdn.7tv.app/emote/01G61H421G0006Z5WTGWA7994Q/4x.avif';
            changeTheme(theme);
        }
        }
    });
}