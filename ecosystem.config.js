module.exports = {
    apps: [{
        name: "fintrack",
        script: "./node_modules/next/dist/bin/next",
        args: "start",
        cwd: "m:/Projects/FinTrackDashboard",
        env: {
            NODE_ENV: "production"
        }
    }]
}
