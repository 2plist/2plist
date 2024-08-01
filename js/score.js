/**
 * Numbers of decimal digits to round to
 */
const scale = 3;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, percent, minPercent) {
    if (rank > 75) {
        return 0;
    }
    if (rank > 25 && percent < 100) {
        return 0;
    }

    // Old formula
    /*
    let score = (100 / Math.sqrt((rank - 1) / 50 + 0.444444) - 50) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    // New formula
    /*
    let score = (-24.9975*Math.pow(rank-1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    
    //New new formula
    /*
    let score = ((473.999389302/(rank + 3.39387060159))-7.87741203178);
    */

    //New new new formula
    let score = ((164.498*(Math.exp(-0.0982586*rank)))+0.896325);
    
    score = Math.max(0, score);

    if (percent == 100) {
        return round(score);
    }
    else if (percent >= minPercent) {
        return round(0.5*score*(percent-minPercent)/(100-minPercent)+0.25*score);
        // quarter points come from list %, quarter points come from completion
        // rest come from progress between that
    }
    else {
        return 0;
    }
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
