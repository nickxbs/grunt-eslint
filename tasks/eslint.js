'use strict';
const chalk = require('chalk');
const eslint = require('eslint');

module.exports = grunt => {
	grunt.registerMultiTask('eslint', 'Validate files with ESLint', function () {
		const opts = this.options({
			outputFile: false,
			quiet: false,
			maxWarnings: -1,
			maxErrors: 0
		});

		if (this.filesSrc.length === 0) {
			grunt.log.writeln(chalk.magenta('Could not find any files to validate'));
			return true;
		}

		const formatter = eslint.CLIEngine.getFormatter(opts.format);

		if (!formatter) {
			grunt.warn(`Could not find formatter ${opts.format}`);
			return false;
		}

		const engine = new eslint.CLIEngine(opts);

		let report;
		try {
			report = engine.executeOnFiles(this.filesSrc);
		} catch (err) {
			grunt.warn(err);
			return false;
		}

		if (opts.fix) {
			eslint.CLIEngine.outputFixes(report);
		}

		let results = report.results;

		if (opts.quiet) {
			results = eslint.CLIEngine.getErrorResults(results);
		}

		const output = formatter(results);

		if (opts.outputFile) {
			grunt.file.write(opts.outputFile, output);
		} else if (output) {
			console.log(output);
		}

		const tooManyWarnings = opts.maxWarnings >= 0 && report.warningCount > opts.maxWarnings;
		const tooManyErrors = opts.maxErrors >= 0 && report.errorCount > opts.maxErrors;
		
		if (!tooManyErrors && tooManyWarnings) {
			grunt.warn(`ESLint found too many warnings (maximum: ${opts.maxWarnings})`);
			return false;
		}
		
		if (tooManyErrors) {
			grunt.log.writeln(chalk.red(`ESLint found too many  errors: ${report.errorCount}(maximum: ${opts.maxErrors})`));
			return !tooManyErrors;
		} 						
		
		if (report.errorCount>0) {
			grunt.log.writeln(chalk.yellow(`ESLint found some errors: ${report.errorCount}(maximum: ${opts.maxErrors})`));			
		} 		
		
		return true;
	});
};
