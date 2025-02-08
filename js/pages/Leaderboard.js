import { fetchLeaderboard, fetchThemes, changeTheme } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        themes: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard">
        <div class="wrapper-theme">
        <div class="theme-container">
        <div class="ball" v-for="theme in themes" :key="theme.name" @click="changeTheme(theme.name)" :style="{ background: theme['color-on-background'], borderColor: theme['color-on-background-hover'] }"></div>
        </div>
        </div>
                <div class="board-container">
                <div  class="board-content">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :class="{ 'active': selected == i }">
                        <div class="wrapper" @click="selected = i">
                            <td class="user" :class="{ 'active': selected == i }">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                                <span class="type-label-lg">{{ ientry.user }}</span>
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                        </div>
                        </tr>
                    </table>
                    </div>
                </div>
                <div class="player-container">
                <div class="player-content">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }} <h3 style="flex: 1; text-align: right;">{{ entry.total }} points</h3></h1>
                        <div class="divider"></div>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table v-if="entry.verified.length > 0" class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p class="type-label-lg">#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p class="type-label-lg">+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table v-if="entry.completed.length > 0" class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p class="type-label-lg">#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p class="type-label-lg">+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table v-if="entry.progressed.length > 0" class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.themes = await fetchThemes();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        changeTheme(themeName) {
            const themeStyles = this.themes.find(t => t.name === themeName);
            if (themeStyles) {
                changeTheme(themeStyles);
            }
        },
        localize,
    },
};
