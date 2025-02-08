import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchThemes, changeTheme } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
                <div class="wrapper-theme">
        <div class="theme-container">
        <div class="ball" v-for="theme in themes" :key="theme.name" @click="changeTheme(theme.name)" :style="{ background: theme['color-on-background'], borderColor: theme['color-on-background-hover'] }"></div>
        </div>
        </div>
            <div class="list-container">
                <div class="list-content">
                    <table class="list" v-if="list">
                        <tr class="level" v-for="([level, err], i) in list" :class="{ 'active': selected == i, 'error': !level }" >
                        <div class="legacy" v-if="i === 75">
                        <p class="type-label-lg">Legacy List</p>
                        </div>
                            <div class="wrapper" @click="selected = i">
                            <td class="info">
                                <p v-if="i + 1 <= 75" class="type-label-lg">#{{ i + 1 }}</p>
                                <p v-else class="type-label-lg" style="color: var(--gradient-color-1-40)">#{{ i + 1 }}</p>
                                    <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}<img src="assets/unrated.png" title="Unrated" alt="unrated" v-if="level?.unrated"></span>
                            </td>
                            </div>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="level-container">
                <div class="level-content">
                <div class="level" v-if="level">
                    <h1>
                    {{ level.name }} 
                     <div class="level-stats">
                    <img src="assets/unrated.png" title="Unrated" alt="unrated" v-if="level.unrated" style="height:3rem;">
                    <h3 style="margin-left: auto;">{{ score(selected + 1, 100, level.percentToQualify) }} points</h3>
                    </div>
                    </h1>
                    <hr class="divider">
                    <LevelAuthors :author="level.author" :verifier="level.verifier"></LevelAuthors>
                    <p>{{ level.desc }}</p>
                    <div class="center-text-video">
                    <div class="wrapper">
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    </div>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <h5>{{ level.id }}</h5>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <h5>{{ level.password || 'Free to Copy' }}</h5>
                        </li>
                    </ul>
                    <h5 class="handcam"><strong>Handcam is {{['not needed', 'recommended', 'necessary'][level.handcam]}} for this level.</strong></h5>
                    </div>
                    <div class="divider"></div>

                    <h2>Records</h2>
                    <h5 v-if="selected + 1 <= 25"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</h5>
                    <h5 v-else-if="selected +1 <= 75"><strong>100%</strong> or better to qualify</h5>
                    <h5 v-else>This level does not accept new records.</h5>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                        </tr>
                    </table>
                </div>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        themes: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            return embed(this.level.verificationVid);
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.themes = await fetchThemes();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
        changeTheme(themeName) {
            const themeStyles = this.themes.find(t => t.name === themeName);
            if (themeStyles) {
                changeTheme(themeStyles);
            }
        },
    },
};
