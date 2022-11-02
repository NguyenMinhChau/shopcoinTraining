const precisionRound = (number) => {
    let precision = 5;
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
};

console.log(precisionRound(parseFloat(0) + parseFloat(4000)));
