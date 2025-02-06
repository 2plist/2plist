import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchChangelog, fetchThemes, changeTheme } from "../content.js";


import Spinner from "../components/Spinner.js";
const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    artist: "brush",
    trial: "user-lock",
};

export default {
    components: { Spinner },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-home">
        <div class="wrapper-theme">
        <div class="theme-container">
        <div class="ball" v-for="theme in themes" :key="theme.name" @click="changeTheme(theme.name)" :style="{ background: theme['color-on-background'], borderColor: theme['color-on-background-hover'] }"></div>
        </div>
        </div>
        <div class="home-container">
            <div class="text-container">
            <h1 v-html="getRandomText()"></h1>
            <hr class="divider">
            <p>
            This list keeps track of the hardest 2-player levels in Geometry Dash that have been done&nbsp;<strong>solo</strong>. Levels must have enough of it's length&nbsp;<i>or</i> difficulty come from it's 2p sections to place on the list. Keep in mind the list is an approximation based on players' opinions, and is <strong>not objective</strong>.
            </p>
            </div>
            <div class="changelog-container">
             <template v-if="changelog">
                <h3>Changelog <hr class="divider"> </h3>
            <ol class="changelog">
                <li v-for="entry in paginatedChangelog" :key="entry.id">
                    <p class="type-label-md" v-html="formatEntryText(entry.date, entry.text)"></p>
                </li>
            </ol>
                        <div class="pagination">
                        <div class="wrapper">
        <button class="btn" @click="firstPage" :disabled="currentPage === 1"><span class="type-label-lg"><<</span></button>
        </div>
        <div class="wrapper">
        <button class="btn" @click="prevPage" :disabled="currentPage === 1"><span class="type-label-lg">Previous</span></button>
        </div>
        <div v-for="page in pageNumbers" :key="page" class="wrapper">
            <button class="btn" @click="goToPage(page)" :class="{ active: currentPage === page }"><span class="type-label-lg">{{ page }}</span></button>
            </div>
        <div class="wrapper" v-if="totalPages > 5">
        <input class="btn"  type="number" v-model.number="inputPage" @keyup.enter="goToInputPage" min="1" :max="totalPages" placeholder="..." />
        </div>
        <div class="wrapper">
        <button class="btn" @click="nextPage" :disabled="currentPage === totalPages"><span class="type-label-lg">Next</span></button>
        </div>
        <div class="wrapper">
        <button class="btn" @click="lastPage" :disabled="currentPage === totalPages"><span class="type-label-lg">>></span></button>
        </div>
            </div>
            </template>
            </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>Staff <hr class="divider"> </h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role" :title="editor.role" style="cursor: help;">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    <div class="og">
                        <p class="type-label-md">List Template by <a href="https://tsl.pages.dev/" target="_blank">The Shitty List</a></p>
                    </div>
                    </template>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        editors: [],
        changelog: [],
        themes: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        currentPage: 1,
        itemsPerPage: 8,
        getRandomText() {
            const randomNumber = Math.floor(Math.random() * 200) + 1;
            return randomNumber === 1 ? 'Welcome to <span class="gradient-text">your mind</span>...' : 'Welcome to the <span class="gradient-text">2P List</span>!';
        },
        inputPage: '', // Initialize to an empty string
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            return embed(this.level.verificationVid);
        },
        paginatedChangelog() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.changelog.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.changelog.length / this.itemsPerPage);
        },
        pageNumbers() {
            const pages = [];
            if (this.totalPages <= 5) {
                for (let i = 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (this.currentPage <= 3) {
                    pages.push(1, 2, 3, 4, 5);
                } else if (this.currentPage >= this.totalPages - 2) {
                    pages.push(this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
                } else {
                    pages.push(this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2);
                }
            }
            return pages;
        }
    },
    async mounted() {
        // Hide loading spinner
        this.editors = await fetchEditors();
        this.changelog = await fetchChangelog();
        this.themes = await fetchThemes();
        // Error handling
        if (!this.editors) {
            this.errors.push("Failed to load staff.");
        }
        if (!this.changelog) {
            this.errors.push("Failed to load changelog.");
        }
        if (!this.themes) {
            this.errors.push("Failed to load themes.");
        }

    
        this.loading = false;
    },
    methods: {
        embed,
        score,
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        changeTheme(themeName) {
            const themeStyles = this.themes.find(t => t.name === themeName);
            if (themeStyles) {
                changeTheme(themeStyles);
            }
        },
        goToInputPage() {
            const page = parseInt(this.inputPage, 10);
            if (!isNaN(page)) {
                if (page > this.totalPages) {
                    this.goToPage(this.totalPages);
                } else if (page < 1) {
                    this.goToPage(1);
                } else {
                    this.goToPage(page);
                }
            }
            this.inputPage = ''; // Clear the input field after navigation
        },
        firstPage() {
            this.currentPage = 1;
        },
        lastPage() {
            this.currentPage = this.totalPages;
        },
        formatEntryText(date, text) {
            const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `${date} - ${formattedText}`;
          }
    }
};
