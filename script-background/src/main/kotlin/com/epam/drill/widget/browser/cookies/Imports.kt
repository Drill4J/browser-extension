@file:JsQualifier("browser.cookies")

package com.epam.drill.widget.browser.cookies

import kotlin.js.Promise

external fun get(info: Info): Promise<Cookie>
external fun set(cookie: Cookie)

external interface Info {
    var url: String?
    var name: String?
}

external interface Cookie {
    var domain: String
    var expirationDate: Long
    var hostOnly: Boolean
    var httpOnly: Boolean
    var name: String
    var path: String
    var sameSite: String
    var secure: Boolean
    var session: Boolean
    var storeId: String
    var value: String
}