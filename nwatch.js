/**
 * This is the structure we want:
 *   nwatch [opts] --file <dir>
 *
 * Example:
 *   nwatch --file . --filter *.(jade|styl) --run build-all
 * assuming build-all is an executable script
 *
 * Built for Windows, since I needed it. No fancy options, just what I need.
 */

var program = require('commander')
var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var version = '0.0.2'

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

var convertToRegex = function (rawExpr)
{
	return new RegExp(rawExpr
					.replace('.','\\.')		// Make sure all dots are interpretted literally
					.replace(/\*/g,'.*')	// Make sure * is converted to .*
				)
}

program
	.version(version)
	.option('-e, --filter <expr>', 
		'Notifies only when a file matching the filter changes. Useful when watching directories', 
		convertToRegex, /.*/)
	.option('-r, --run <cmd>', 'Runs the given command when a change notice is generated')
	.option('-f, --file <file>', 'Watches this file|directory for changes')
	.parse(process.argv)

// Perform filename validation
if (!program.file)
{
	console.error('Please specify a file|directory to watch')
	return
}

var commandExecutedHandler = function (error, stdout, stderr) {
	console.log(stdout)
	stderr && console.log('Error: ', stderr)
}

// Used to debounce the shell command execution
var debouncer = null
var debouncedChangeHandler = function (event, filename) {
	if (program.filter.test(filename))
	{
		clearTimeout(debouncer)
		Events.add(filename, event)

		debouncer = setTimeout(function () {
			Events.print().clear()
			program.run && exec(program.run, commandExecutedHandler)
		}, 500)
	}
}

// Core Execution
fs.watch(path.resolve(program.file), debouncedChangeHandler)
