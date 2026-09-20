tasks.register<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}

tasks.register<Exec>("npmLint") {
    commandLine("npm", "run", "lint")
}

tasks.register("assembleDebug") {
    dependsOn("npmBuild")
}

tasks.register("lint") {
    dependsOn("npmLint")
}
