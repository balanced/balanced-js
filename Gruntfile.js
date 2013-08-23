module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            js: {
                options: {
                    banner: '////\n// <%= pkg.name %>\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    footer: grunt.file.read('license.txt', {
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
                    banner: '////\n// balanced.js proxy\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    wrap: 'balanced'
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
        htmlbuild: {
            proxy: {
                src: 'templates/proxy.html',
                dest: 'build/proxy.html',
                options: {
                    beautify: false,
                    sections: {
                        js: 'build/balanced-proxy.js'
                    }
                }
            }
        },
        purge: {
            js: {
                src: 'build/<%= pkg.name %>'
            },
            proxy: {
                src: [
                    'build/balanced-proxy.js',
                    'build/proxy.html'
                ]
            }
        },
        ////
        // This tasks blocks, i.e. creates a node.js connect http server
        ////
        connect: {
            server: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: 'build',
                    keepalive: true
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Build tasks
    grunt.registerTask('default', ['uglify:js', 'uglify:proxy', 'htmlbuild:proxy']);
    grunt.registerTask('build', ['uglify:js', 'uglify:proxy', 'htmlbuild:proxy']);
    grunt.registerTask('build-js', 'uglify:js');
    grunt.registerTask('build-proxy', ['uglify:proxy', 'htmlbuild:proxy']);

    // Clean tasks
    grunt.renameTask('clean', 'purge');
    grunt.registerTask('clean', ['purge:js', 'purge:proxy']);
    grunt.registerTask('clean-js', 'purge:js');
    grunt.registerTask('clean-proxy', 'purge:proxy');

    // Serve task
    grunt.registerTask('serve-proxy', 'connect');
};