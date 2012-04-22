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
var version = '0.0.3'

// Used to keep track of file operations
var Events = {
	// Contains all the events since last clear
	results:{},

	// Add a new file operation to the events map
	add: function (filename, operation) {
		this.results[filename] = [filename, ' ', operation, 'd'].join('')
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
	.option('-R, --recursive', 'watches for changes in sub-directories as well')
	.option('-e, --filter <pattern>', 'notifies only when a file matching the pattern changes', convertToRegex, /.*/)
	.option('-r, --run <cmd>', 'runs the given command when a change notice is generated')
	.option('-f, --file <file>', 'watches the given file|directory for changes. Defaults to current directory', '.')
	.option('-x, --exclude <pattern>', 'excludes directories matching this pattern from being watched', convertToRegex)
	.option('-v, --verbose', 'prints detailed information during execution')
	.parse(process.argv)

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

var getAllSubDirectories = function (filepath, directories) {
	var files = fs.readdirSync(filepath)

	for (var i = 0; i < files.length; i++)
	{
		var file = path.join(filepath, files[i])

		if (fs.statSync(file).isDirectory())
		{
			directories.push(file)
			getAllSubDirectories(file, directories)
		}
	}
}

var shouldBeIncluded = function (element, index, array) {
	return (program.exclude) ? !program.exclude.test(element) : true
}

var main = function () {
	var filepath = path.resolve(program.file)
	var isFile = fs.statSync(filepath).isFile()

	if (isFile || !program.recursive)
	{
		fs.watch(path.resolve(program.file), debouncedChangeHandler)
	}
	else
	{
		var directories = [ filepath ]
		getAllSubDirectories(filepath, directories)

		if (program.verbose)
		{
			console.info('Complete directory list:')
			console.info(directories.join('\n'))
		}

		directories = directories.filter(shouldBeIncluded)

		if (program.verbose)
		{
			console.info('Filtered list to watch:')
			console.info(directories.join('\n'))
		}

		for (var i = 0; i < directories.length; i++)
		{
			fs.watch(directories[i], debouncedChangeHandler)
		}
	}
}

main()