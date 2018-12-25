pluginManagement {
    repositories {
        maven(url = "http://dl.bintray.com/kotlin/kotlin-eap")
        maven(url = "https://dl.bintray.com/kotlin/kotlin-eap")
        gradlePluginPortal()
    }
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "kotlin2js") {
                useModule("org.jetbrains.kotlin:kotlin-gradle-plugin:${requested.version}")
            }
            if (requested.id.id == "org.jetbrains.kotlin.frontend") {
                useModule("org.jetbrains.kotlin:kotlin-frontend-plugin:0.0.44")
            }
        }
    }
}

rootProject.name = "drill-browser-extension"

include(":script-background")
include(":script-content")