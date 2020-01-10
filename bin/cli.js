#!/usr/bin/env node

var program = require('commander');
const path = require('path');
const readline = require('readline')
const util = require('../tools/util');
const page = require('../tools/page');

/**
 * Install an around function; AOP.
 */

function around(obj, method, fn) {
    var old = obj[method]

    obj[method] = function() {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
    var old = obj[method]

    obj[method] = function() {
        fn.call(this)
        old.apply(this, arguments)
    }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm(msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(msg, function(input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
    })
}


/**
 * Graceful exit for async STDIO
 */

function exit(code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done() {
        if (!(draining--)) process.exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function(stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
    })

    done()
}

program.command('page <subcommand> <slxPrjRoot> [param]')
    .alias('r')
    .description('add or delete page')
    .action(function(subcommand, slxPrjRoot, param) {
        switch (subcommand) {
            case "add":
                page.add(slxPrjRoot, param);
                break;
            case "destroy":
                page.destroy(slxPrjRoot, param);
                break;
            default:
                console.error("The subcommand:" + subcommand + " is unknown");
                break;
        }
    });

program.parse(process.argv)

if (program.args.length === 0) {
    program.help()
}