/*jshint camelcase: false */
/*global module:false */
module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            js: {
                options: {
                    banner: '////\n// <%= pkg.name %>\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    footer: '\n\n/*' + grunt.file.read('license.txt') + '*/',
                    mangle: false,
                    beautify: true,
                    wrap: 'balanced'
                },
                files: {
                    'build/<%= pkg.name %>': [
                        'src/<%= pkg.name %>',
                        'src/utils.js',
                        'lib/json2.js',
                        'lib/xd.js'
                    ]
                }
            },
            proxy: {
                options: {
                    banner: '////\n// balanced.js proxy\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    mangle: false,
                    beautify: true
                },
                files: {
                    'build/balanced-proxy.js': [
                        'src/proxy.js',
                        'lib/json2.js',
                        'lib/ajax.js',
                        'lib/xd.js'
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
                        proxyjs: 'build/balanced-proxy.js'
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
            },
            example: {
                src: [
                    'build/example'
                ]
            },
            test: {
                src: [
                    'build/test',
                    'report'
                ]
            }
        },

        connect: {
            keepalive: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: 'build',
                    keepalive: true
                }
            },
            test: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: 'build'
                }
            }
        },

        concat: {
            test: {
                src: [
                    'test/unit/**/*.js'
                ],
                dest: 'build/test/js/tests.js'
            }
        },

        copy: {
            example: {
                files: [
                    {
                        cwd: 'example/',
                        expand: true,
                        src: ['**'],
                        dest: 'build/example'
                    }
                ]
            },
            test: {
                files: [
                    {
                        src: 'test/support/testconfig.js',
                        dest: 'build/test/js/testconfig.js'
                    },
                    {
                        cwd: 'test/support/static/',
                        expand: true,
                        src: ['**'],
                        dest: 'build/test/'
                    },
                    {
                        cwd: 'test/support/lib/',
                        expand: true,
                        src: ['**'],
                        dest: 'build/test/js'
                    },
                ]
            },
        },

        karma: {
            unit: {
                options: {
                    frameworks: [
                        'qunit'
                    ],
                    files: [
                        'build/test/js/sinon.js',
                        'build/test/js/testconfig.js',
                        'build/balanced.js',
                        'build/test/js/tests.js'
                    ],
                    preprocessors: {
                        'build/balanced.js': [
                            'coverage'
                        ]
                    },
                    reporters: [
                        'progress',
                        'coverage'
                    ],
                    coverageReporter: {
                        type: 'html',
                        dir: 'report'
                    },
                    port: 9876,
                    colors: true,
                    autoWatch: false,
                    browsers: ['Chrome', 'Firefox'],
                    captureTimeout: 60000,
                    singleRun: true
                }
            }
        },

        s3: {
            options: {
                bucket: 'balanced-js',
                access: 'public-read',
                region: 'us-west-1',
                gzip: true,
                headers: {
                    'X-Employment': 'aXdhbnR0b21ha2VhZGlmZmVyZW5jZStobkBiYWxhbmNlZHBheW1lbnRzLmNvbQ=='
                }
            },
            cached: {
                headers: {
                    'Cache-Control': 'public, must-revalidate, proxy-revalidate, max-age=31536000',
                    'Pragma': 'public'
                },
                upload: [
                    {
                        src: 'build/balanced.js',
                        dest: 'balanced.js'
                    },
                    {
                        src: 'build/proxy.html',
                        dest: 'proxy.html'
                    },
                    {
                        src: 'build/balanced.js',
                        dest: '<%= pkg.version %>/balanced.js'
                    },
                    {
                        src: 'build/proxy.html',
                        dest: '<%= pkg.version %>/proxy.html'
                    }
                ]
            },
            not_cached: {
                headers: {
                    'Cache-Control': 'max-age=60'
                },
                upload: [
                    {
                        src: 'build/balanced.js',
                        dest: 'balanced.js'
                    },
                    {
                        src: 'build/proxy.html',
                        dest: 'proxy.html'
                    },
                    {
                        src: 'build/balanced.js',
                        dest: '<%= pkg.version %>/balanced.js'
                    },
                    {
                        src: 'build/proxy.html',
                        dest: '<%= pkg.version %>/proxy.html'
                    }
                ]
            }
        },

        open: {
            serve: {
                path: 'http://localhost:3000/example/index.html',
                app: 'Google Chrome'
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-open');

    // Build tasks
    grunt.registerTask('default', ['uglify', 'htmlbuild']);
    grunt.registerTask('build', 'default');

    // Clean tasks
    grunt.renameTask('clean', 'purge');
    grunt.registerTask('clean', 'purge');

    // Serve tasks
    grunt.registerTask('serve', ['clean', 'build', 'copy:example', 'open:serve', 'connect:keepalive']);

    // Test task
    grunt.registerTask('test', ['clean', 'build', 'copy:test', 'concat:test', 'connect:test', 'karma']);

    // Deploy task
    grunt.registerTask('deploy', ['clean', 'build', 's3:cached']);
};
