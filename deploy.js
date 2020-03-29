/* .: Dependencies :. */
const {execSync} = require('child_process')
const {bold, blue, green, white, bgRed, bgGreen, grey, bgMagenta} = require('colors')
const ora = require('ora')

/* .: Constants :. */
const MESSAGE = process.argv[2] || 'commit changes'
const VERSION = process.argv[3] || 'patch'
const DEBUG = process.env.DEBUG !== undefined

/* .: Functions :. */
let commands = {
    commit: `git add %s . && git commit %s -am "${MESSAGE}"`,
    push: "git push --tags %s origin master",
    publish: "npm publish %s"
}

for (let key in commands) {
    commands[key] = commands[key].replace(/%s/g, DEBUG ? "--dry-run" : "")
}

function execCommand(command, message, debug = false) {
    const cmdText = grey(` - '${command}'\n`)
    const text = bold(blue(`${message}...`)) + cmdText
    const spinner = ora({
        text,
        color: 'blue',
        discardStdin: false
    }).start()

    try {
        if (!debug) execSync(command, { timeout: 60 * 1000 })
        spinner.succeed(bold(green(`${message} completed`)) + cmdText)
    } catch (e) {
        spinner.fail(`[Err] ${e.message}`)
    }
}

/* .: Run :. */
console.log(white(bgGreen("--- APP DEPLOYMENT ---")))
if (DEBUG) console.log(white(bgMagenta("!!! DEBUG MODE !!!")))
console.log("\n\n")
try {
    execCommand("npm run build", "Build application", DEBUG)
    execCommand("npm run doc", "Build API docs...", DEBUG)
    execCommand(commands.commit, `Commit "${MESSAGE}"`)
    execCommand(`npm version "${VERSION}"`, `Patch npm package version "${VERSION}"`, DEBUG)
    execCommand(commands.push, "Github deployment")
    execCommand(commands.publish, "Publish into npm")

    console.log(white(bgGreen("\n--- DEPLOYMENT SUCCESSFULLY COMPLETED ---")))
} catch (e) {
    console.log(white(bgRed("\n--- ERROR DURING DEPLOYMENT ---")))
    throw e
}
if (DEBUG) console.log(bgMagenta("!!! DEBUG MODE !!!"))
process.exit()
