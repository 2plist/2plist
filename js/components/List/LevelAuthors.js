export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        }
    },
    template: `
        <div class="level-authors">
            <div class="type-title-sm">Author</div>
            <p class="type-body">
                <span>{{ author }}</span>
            </p>
            <div class="type-title-sm">Verifier</div>
            <p class="type-body">
                <span>{{ verifier }}</span>
            </p>
        </div>
    `
};
