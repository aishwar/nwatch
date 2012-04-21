/**
 * This is the structure we want:
 *   nwatch <dir> <runcmd>
 *
 * Example:
 *   nwatch . build-all
 * assuming build-all is an executable script
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

// Used to keep track of file operations
var Events = {
	// Contains all the events since last clear
	results:{},

	// Add a new file operation to the events map
	add: function (filename, operation) {
		this.results[filename] = [filename, " ", operation, "d"].join('')
		return this
	},

	// Print to screen
	print: function () {
		var results = this.results

		for (var filename in results)
		{
			console.log(results[filename])
		}

		return this
	},

	// Empty the events map
	clear: function () {
		this.results = {}
		return this
	}
}

var commandExecutedHandler = function (error, stdout, stderr) {
	console.log(stdout)
	stderr && console.log('Error: ', stderr)
}

// Used to debounce the shell command execution
var debouncer = null
var debouncedChangeHandler = function (event, filename) {
	clearTimeout(debouncer)
	Events.add(filename, event)

	debouncer = setTimeout(function () {
		Events.print().clear()
		exec(shellcommand, commandExecutedHandler)
	}, 500)
}

// Core Execution
fs.watch(path.resolve(filename), debouncedChangeHandler)
