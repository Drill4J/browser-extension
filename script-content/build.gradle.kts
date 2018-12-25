import org.jetbrains.kotlin.gradle.dsl.KotlinJsCompile
import org.jetbrains.kotlin.gradle.frontend.webpack.WebPackExtension

plugins {
    id("kotlin2js")
    id("org.jetbrains.kotlin.frontend")
}

repositories {
    mavenCentral()
}

dependencies {
    compile(kotlin("stdlib-js"))
    compile("org.jetbrains.kotlinx:kotlinx-coroutines-core-js:1.0.0")
}


kotlinFrontend {
    bundle("webpack") {
        if (this is WebPackExtension) {
            bundleName = project.name
            contentPath = file("config")
        }
    }
}


dependencies {
    compile(kotlin("stdlib-js"))
}
tasks{
    "compileKotlin2Js"(KotlinJsCompile::class) {
        configure {
            kotlinOptions {
                sourceMap = true
                sourceMapEmbedSources = "always"
                moduleKind = "commonjs"
                metaInfo = false
            }
        }
    }
}