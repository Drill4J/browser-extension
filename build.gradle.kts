import org.jetbrains.kotlin.gradle.dsl.KotlinJsCompile
import org.jetbrains.kotlin.gradle.frontend.webpack.WebPackBundler
import org.jetbrains.kotlin.gradle.frontend.webpack.WebPackExtension

plugins {
    id("kotlin2js") version "1.3.11"
    id("org.jetbrains.kotlin.frontend")
}

repositories {
    mavenCentral()
}

kotlinFrontend {
    npm {
        dependency("webextension-polyfill")
    }
}

tasks {
    register("copyWeb", Copy::class) {
        from("config")
        into("build/extension")
    }
    register("copyBrowserPolyfill", Copy::class) {
        dependsOn("bundle")
        from("build/node_modules/webextension-polyfill/dist") {
            include("browser-polyfill.min.js")
        }
        into("build/extension")
    }
    register("copyBundle", Copy::class) {
        dependsOn(subprojects.map{it.name}.map{":$it:bundle"})

        val map = subprojects.map { it.file("build/bundle") }
        map.forEach { println(it) }
        from(map) {
            rename("(.*)\\.bundle.js", "$1.js")
        }
        into(rootProject.file("build/extension"))


    }
    register("prepareExtension") {
        dependsOn("copyWeb", "copyBundle", "copyBrowserPolyfill")
    }
    register("zipExtension", Zip::class) {
        dependsOn("prepareExtension")
        from("build/extension")
    }


    register("extension")
    {
        dependsOn("zipExtension")
    }
    "assemble"{
        dependsOn("extension")
    }
}
