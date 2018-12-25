package com.epam.drill.widget

import kotlin.browser.document


fun getCookies(): Map<String, String> {
    if (document.cookie.isEmpty()) {
        return mapOf()
    }
    return document.cookie.split("; ").map { rawCookie -> rawCookie.split("=") }.map {
        if (it.size > 1) {
            it[0] to it[1]
        } else "" to ""
    }.toMap()
}