Usage:
======

    nwatch [options]

Options:
========

    -h, --help               output usage information
    -V, --version            output the version number
    -R, --recursive          watches for changes in sub-directories as well
    -e, --filter <pattern>   notifies only when a file matching the pattern changes
    -r, --run <cmd>          runs the given command when a change notice is generated
    -f, --file <file>        watches the given file|directory for changes. Defaults to current directory
    -x, --exclude <pattern>  excludes directories matching this pattern from being watched
    -v, --verbose            prints detailed information during execution

Note:
-----

The `--filter`, `--exclude` patterns are javascript regular expressions (with 2 exceptions; read on). The dots (`.`) in the expression will be escaped to be used as a literal dot. The asterisks (`*`) in the expression will be converted to `.*` (match all selector). This is done for convenience. These changes allow you to specify an expresion like `*.jade` instead of `.*\\.jade`.

Example:
========

    nwatch --recursive --filter "*.(jade|styl)" --run build-all

assuming `build-all` is an executable script.

Install:
========

    npm install -g nwatch
