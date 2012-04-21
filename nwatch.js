/**
 * This is the structure we want:
 *   nwatch <dir> <runcmd>
 *
 * Example:
 *   nwatch . build-all
 * assuming build is an executable script
 *
 * Built for Windows, since I needed it. No fancy options, just what I need.
 */

var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var args = process.argv.slice(2)

// User inputs
var filename = args[0]
var shellcommand = args[1]

// Validations
if (!filename)
{
	console.error('Error: File to watch not specified')
	return
}

if (!shellcommand)
{
	console.error('Error: Command to execute on file change not specified')
	return
}

// Used to debounce the shell command execution
var debouncer = null

var commandExecutedHandler = function (error, stdout, stderr) {
	console.log(stdout)
	stderr && console.log('Error: ', stderr)
}

var debouncedChangeHandler = function (event, filename) {
	clearTimeout(debouncer)
	debouncer = setTimeout(function () {
		console.log("%s %sd", filename, event)
		exec(shellcommand, commandExecutedHandler)
	}, 1)
}

// Core Execution
fs.watch(path.resolve(filename), debouncedChangeHandler)
