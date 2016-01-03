module.exports = function(grunt) {

    var grunt_config = {
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['build/']
        },
        copy: {
            build: {
                cwd: '<%= pkg.name %>',
                src: [
                    '**/*',
                    '!widgets/demo.php',
                    '!widgets/demo/js.cookie.js'
                ],
                dest: 'build/',
                expand: true
            }
        },
        imagemin: {                          // Task
            build: {
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'build/',
                    src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                }]
            }
        },
        jshint: {
            build: ['plugins-dev/**/*.js', 'build/**/*.js']
        },
        makepot: {
            build: {
                options: {
                    cwd: 'build/',
                    domainPath: 'languages/',
                    potFilename: '<%= pkg.name %>.pot',
                    mainFile: 'style.css',
                    type: 'wp-theme'
                }
            }
        },
        addtextdomain: {
            build: {
                options: {
                    textdomain: '<%= pkg.name %>'
                },
                files: {
                    src: [
                        'build/*.php'
                    ]
                }
            }
        },
        uglify: {
            build: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> javascript.min.js <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %> */\n',
                    report: 'gzip'
                },
                files: {
                    'build/js/javascript.min.js': [
                        'build/js/javascript.js'
                    ]
                }
            }
        },
        version: {
            css: {
                options: {
                    prefix: 'Version\\:\\s+'
                },
                src: ['build/style.css', 'build/style.less'],
            },
            themeversion: {
                options: {
                    prefix: "\\( '_BEAUTIFUL_THEME_VERSION', '"
                },
                src: ['build/functions.php'],
            }
        },
        compress: {
            child: {
                options: {
                    archive: '<%= pkg.name %>-child.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= pkg.name %>-child/',
                        src: ['**'],
                        dest: '<%= pkg.name %>-child'
                    }
                ]
            },
            build: {
                options: {
                    archive: '<%= pkg.name %>.<%= pkg.version %>.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'build/',
                        src: ['**'],
                        dest: '<%= pkg.name %>'
                    }
                ]
            }
        },
    };

    grunt.initConfig(grunt_config);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-wp-i18n' );
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-version');

    grunt.registerTask('build-plugins', [
        'init-plugin-build',
    ]);

    grunt.registerTask( 'build', [
        'clean:build',
        'copy:build',
        'imagemin:build',
        'uglify:build',
        'version:css',
        'version:themeversion',
        //'jshint:build',
        'addtextdomain',
        'makepot',
        'init-plugin-build',
        'compress:child',
        'compress:build'
    ]);

    grunt.registerTask("init-plugin-build", "Builds plugin folders into zip files for theme", function() {

        // read all subdirectories from your modules folder
        grunt.file.expand({matchBase:true},"./plugins-dev/*").forEach(function (dir) {

            var dir_name = dir.split(/[\\/]/).pop();;
            // get current compress options.
            var compress = grunt.config.get('compress') || {};

            // set the config for this modulename-directory
            compress[dir_name] = {
                options: {
                    archive: 'build/plugins/' + dir_name + '.zip'
                },
                files: [
                    {expand: true, cwd: dir, src: ['**'], dest: dir_name}
                ]
            };

            grunt.config.set('compress', compress);
            grunt.task.run('compress:'+dir_name);
        });
        //grunt.task.run('compress');
    });

};
