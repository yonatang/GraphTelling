({
    baseUrl: "scripts",
    out: 'build/main.js',
    name: "app",
    wrap: true,
    include: ['lib/require'],
    paths: {
        d3: 'lib/d3.min',
        require: 'lib/require',
    }
})