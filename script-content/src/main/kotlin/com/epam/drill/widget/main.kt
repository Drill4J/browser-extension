package com.epam.drill.widget

import kotlin.browser.document

fun main(args: Array<String>) {
    val drillSessionId = getCookies()["DrillSessionId"]
    val drillAdminAddress = getCookies()["DrillAdminAddress"]
    if (drillSessionId != null && drillAdminAddress != null && getCookies()["DrillEnable"]?.toBoolean() == true) {
        createWidgetRootContainer()
        injectWidgetJs(drillAdminAddress)
        injectWidgetCss(drillAdminAddress)
    }
}

private fun injectWidgetCss(drillAdminAddress: String?) {
    val linkElement = document.createElement("link")
    linkElement.setAttribute("type", "text/css")
    linkElement.setAttribute("rel", "stylesheet")
    linkElement.setAttribute("href", "$drillAdminAddress/style/index.css")
    document.head?.appendChild(linkElement)
}

private fun injectWidgetJs(drillAdminAddress: String?) {
    val scriptElement = document.createElement("script")
    scriptElement.setAttribute("type", "text/javascript")
    scriptElement.setAttribute("src", "$drillAdminAddress/bundle.js")
    document.head?.appendChild(scriptElement)
}

private fun createWidgetRootContainer() {
    val container = document.createElement("div")
    container.setAttribute("id", "widget-root")
    document.body?.appendChild(container)
}
