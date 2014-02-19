/*jshint camelcase: false */
/*global module:false */

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            js: {
                options: {
                    banner: '////\n// <%= pkg.name %>\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n// https://github.com/balanced/balanced-js\n////\n\n',
                    mangle: false,
                    beautify: true,
                    compress: false,
                    wrap: 'balanced'
                },
                files: {
                    'build/balanced.js': [
                        'src/<%= pkg.name %>'
                    ]
                }
            },
            js_min: {
                options: {
                    banner: '////\n// <%= pkg.name %>\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n// https://github.com/balanced/balanced-js\n////\n\n',
                    mangle: true,
                    beautify: false,
                    compress: true,
                    wrap: 'balanced'
                },
                files: {
                    'build/balanced.min.js': [
                        'src/<%= pkg.name %>'
                    ]
                }
            },
            json: {
                options: {
                    banner: '////\n// json2.js \n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    mangle: true,
                    beautify: false,
                    compress: true
                },
                files: {
                    'build/json2.js': [
                        'lib/json2.js'
                    ]
                }
            }
        },

        purge: {
            js: {
                src: [
                    'build/<%= pkg.name %>',
                    'build/json2.js'
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
            callback: {
                files: [
                    {
                        cwd: 'src/',
                        expand: true,
                        src: ['callback.html'],
                        dest: 'build'
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
                        'build/test/js/tests.js',
                        'build/test/oauth_test.html'
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
                    browsers: ['Firefox'],
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
            fullyVersionized: {
                headers: {
                    'Cache-Control': 'public, must-revalidate, proxy-revalidate, max-age=31536000',
                    'Pragma': 'public'
                },
                upload: [
                    {
                        src: 'build/balanced.js',
                        dest: '<%= pkg.version %>/balanced.js'
                    },
                    {
                        src: 'build/balanced.min.js',
                        dest: '<%= pkg.version %>/balanced.min.js'
                    },
                    {
                        src: 'build/json2.js',
                        dest: '<%= pkg.version %>/json2.js'
                    },
                    {
                        src: 'build/callback.html',
                        dest: '<%= pkg.version %>/callback.html'
                    }
                ]
            },
            semiVersionized: {
                headers: {
                    'Cache-Control': 'max-age=300',
                    'Pragma': 'public'
                },
                upload: [
                    {
                        src: 'build/balanced.js',
                        dest: '<%= pkg.versionMajor %>/balanced.js'
                    },
                    {
                        src: 'build/balanced.min.js',
                        dest: '<%= pkg.versionMajor %>/balanced.min.js'
                    },
                    {
                        src: 'build/json2.js',
                        dest: '<%= pkg.versionMajor %>/json2.js'
                    },
                    {
                        src: 'build/callback.html',
                        dest: '<%= pkg.versionMajor %>/callback.html'
                    }
                ]
            },
            latest: {
                headers: {
                    'Cache-Control': 'max-age=300',
                    'Pragma': 'public'
                },
                upload: [
                    {
                        src: 'build/balanced.js',
                        dest: 'balanced.js'
                    },
                    {
                        src: 'build/balanced.min.js',
                        dest: 'balanced.min.js'
                    },
                    {
                        src: 'build/json2.js',
                        dest: 'json2.js'
                    },
                    {
                        src: 'build/callback.html',
                        dest: 'callback.html'
                    }
                ]
            }
        },

        open: {
            serve: {
                path: 'http://localhost:3000/example/index.html'
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
    grunt.registerTask('default', 'uglify');
    grunt.registerTask('build', ['default', 'copy:callback']);

    // Clean tasks
    grunt.renameTask('clean', 'purge');
    grunt.registerTask('clean', 'purge');

    // Serve tasks
    grunt.registerTask('serve', ['clean', 'build', 'copy:example', 'open:serve', 'connect:keepalive']);

    // Test task
    grunt.registerTask('test', ['clean', 'build', 'copy:test', 'concat:test', 'connect:test', 'karma']);

    // Deploy task
    grunt.registerTask('deploy', ['clean', 'build', 's3']);
};
