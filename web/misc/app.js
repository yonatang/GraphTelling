// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: '.',
    paths: {
        d3: '../common/d3.min',
        utils: '../common/utils',
        'views/absView': '../views/absView',
        'views/absXYView': '../views/absXYView',
        'views/pie': '../views/pie',
        'views/bars': '../views/bars',
        'trans/absTrans': '../trans/absTrans',
        'trans/bars2pie': '../trans/bars2pie'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['main']);