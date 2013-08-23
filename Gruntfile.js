module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            js: {
                options: {
                    banner: '/* <%= pkg.name %> \n version: <%= pkg.version %> \n built: <%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
                    footer: grunt.file.read('./license.txt', {
                        encoding: 'utf8'
                    }),
                    mangle: false,
                    beautify: true,
                    wrap: 'balanced'
                },
                files: {
                    'build/<%= pkg.name %>': [
                        'lib/xd.js',
                        'src/<%= pkg.name %>',
                        'src/utils.js'

                    ]
                }
            },
            proxy: {
                options: {
                    mangle: false,
                    beautify: true
                },
                files: {
                    'build/balanced-proxy.js': [
                        'lib/ajax.js',
                        'lib/xd.js',
                        'src/proxy.js'
                    ]
                }
            }
        },
        clean: {
            js: {
                src: 'build/balanced.js'
            },
            proxy: {
                src: 'build/balanced-proxy.js'
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Define tasks
    grunt.registerTask('default', ['uglify:js', 'uglify:proxy']);
    grunt.registerTask('build', ['uglify:js', 'uglify:proxy']);
    grunt.registerTask('build-js', 'uglify:js');
    grunt.registerTask('build-proxy', 'uglify:proxy');
    grunt.registerTask('clean', ['clean:js', 'clean:proxy']);
    grunt.registerTask('clean-js', 'clean:js');
    grunt.registerTask('clean-proxy', 'clean:proxy');
};