'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        name: 'gmodule',
        src: 'src',
        dist: 'dist',
        example:'example'
    };

    try {
        yeomanConfig.src = require('./component.json').appPath || yeomanConfig.src;
    } catch (e) {}

    grunt.initConfig({
        yeoman: yeomanConfig,
        livereload:{
            port: 35723
        },
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.src %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.src %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.src %>}/scripts/{,*/}*.js',
                    '<%= yeoman.src %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9300,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.src)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dev:{
                options: {}
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.src %>/{,*/}*.js'
            ]
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 9339,
                browsers: ['Chrome', 'Firefox']
            },
            unit: {
                reporters: 'dots'
            },
            continuous: {
                singleRun: true,
                browsers: ['PhantomJS']
            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/<%= yeoman.name %>.js': [
                        '.tmp/{,*/}*.js',
                        '<%= yeoman.src %>/{,*/}*.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/<%= yeoman.name %>.min.js': [
                        '<%= yeoman.dist %>/<%= yeoman.name %>.js'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.src %>',
                    dest: '<%= yeoman.dist %>',
                    src: []
                }]
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', [
        'clean:server',
        'livereload-start',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'connect:test',
        'karma:ci'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'test',
        'concat',
        'copy',
        'uglify',
    ]);

    grunt.registerTask('default', ['build']);
};
