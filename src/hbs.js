import hbs from 'hbs';

hbs.registerHelper('ifIn', function(arg1, arg2, options) {
    if (arg2 && arg2.includes(arg1)){
        return options.fn(this)
    }
    return options.inverse(this);
});

export default hbs;
