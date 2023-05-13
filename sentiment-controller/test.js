var { getSentimentOfText } = require('./index');
var assert = require('assert');

const helperLogic = async (x) => {
    const res = await getSentimentOfText(x);
    if(res < 0){
        return 0;
    }
    else if(res <= 0.3){
        return 1;
    }
    else{
        return 2;
    }
}

it('should behave as expected for a strongly positive review', async function() {
    assert.equal(await helperLogic(("I love this movie!")), 2);
})

it('should behave as expected for a strongly negative review', async function() {
    assert.equal(await helperLogic(("I hate this movie!")), 0);
})

it('should behave as expected for a fairly neutral review', async function() {
    assert.equal(await helperLogic(("I am neutral.")), 1);
})