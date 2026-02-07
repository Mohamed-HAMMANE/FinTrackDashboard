module.exports = {
    apps: [{
        name: "fintrack",
        script: "./node_modules/next/dist/bin/next",
        args: "start -p 3020",
        cwd: "m:/Projects/FinTrackDashboard",
        env: {
            NODE_ENV: "production",
            PORT: 3020
        }
    }]
}
