Usage:
======

    nwatch [options]

Options:
========

  **-h, --help**           output usage information
  **-V, --version**        output the version number
  **-e, --filter &lt;expr&gt;**  Notifies only when a file matching the filter changes. Useful when watching directories
  **-r, --run &lt;cmd&gt;**      Runs the given command when a change notice is generated
  **-f, --file &lt;file&gt;**    Watches this file|directory for changes

Note:
=====

Specifying a file to watch is required (the `--file` option).

The `--filter` expression is a regular expression (with 2 expceptions; read on). The dots (.) in the expression will be escaped to be used as a literal dot. The asterisks (*) in the expression will be converted to `.*` (match all selector). This is done for convenience.

Example:
========

    nwatch --file . --filter "*.(jade|styl)" --run build-web

assuming `build-web` is an executable script.