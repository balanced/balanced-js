module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> \n version: <%= pkg.version %> \n built: <%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
                footer: grunt.file.read('./license.txt', {
                    encoding: 'utf8'
                })
            },
            build: {
                src: [
                    'src/<%= pkg.name %>.js',
                    'src/xd.js',
                    'src/utils.js'
                ],
                dest: 'build/<%= pkg.name %>'
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Define tasks
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('build', ['uglify']);
};