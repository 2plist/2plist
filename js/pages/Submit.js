import {fetchThemes, changeTheme, secretTheme} from '../content.js';

export default {
    data: () => ({
        themes: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-submit">
        <div class="wrapper-theme">
        <div class="theme-container">
        <div class="ball" v-for="theme in themes" :key="theme.name" @click="changeTheme(theme.name)" :style="{ background: theme['color-on-background'], borderColor: theme['color-on-background-hover'] }"></div>
        </div>
        </div>
        <div class="submit-container">
            <h1>Submission Requirements</h1>
            <div class="divider"></div>
            <p>
                Completion must be solo - all records must be achieved without another player.
                <br><br>
                Achieved the record without using hacks (however, some hacks are allowed, such as CBF).
                <br><br>
                Switching inputs or keybinds mid-attempt is allowed.
                <br><br>
                Do not bind one key to both inputs (meaning you can't have one key that jumps with player 1 and player 2. Also do not have a custom keycap that covers two keys)
                <br><br>
                Do not use more than 4 keys bound to inputs in a completion. For example, you can have two keys bound to player 1 and two keys bound to player 2.
                <br><br>
                Do not use major secret routes or bug routes. If you are unsure if a skip is invalid, contact an admin.
                <br><br>
                Achieved the record on the level that is listed on the site - please check the level ID before you submit a record. For levels that are bugged, we have a channel in the discord server where we have listed every bugfix ID you'll need.
                <br><br>
                Have clicks/taps in the video. Edited audio only does not count. Handcam will only be needed for levels that have the requirement for it.
                <br><br>
                The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this.
                <br><br>
                The recording must also show the level complete screen, or the completion will be invalidated.
                <br><br>
                Once a level falls onto the Legacy List (#76 and below), we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level.
            </p>    
            <div class="wrapper">
            <button class="btn">
            <a class="type-label-lg" href="https://docs.google.com/forms/d/e/1FAIpQLSd40KOu8uAGf5aW-CObtjHsg2Pe33TefGPd__ZnJQkXCrBeaA/viewform" target="_blank">Submit a Record</a>
            </button>
            </div>
        </div>
        </main>
    `,
    async mounted() {
        this.themes = await fetchThemes();
        await secretTheme();
        this.loading = false;
        },
        methods: {
            changeTheme(themeName) {
                const themeStyles = this.themes.find(t => t.name === themeName);
                if (themeStyles) {
                    changeTheme(themeStyles);
                }
            },
        },
};
