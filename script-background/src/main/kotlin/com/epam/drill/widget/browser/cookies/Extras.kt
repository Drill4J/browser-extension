package com.epam.drill.widget.browser.cookies


@Suppress("UNCHECKED_CAST_TO_NATIVE_INTERFACE", "UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")
inline fun cookieSearcher(block: Info.() -> Unit) =
    (js("{}") as Info).apply(block)

@Suppress("UNCHECKED_CAST_TO_NATIVE_INTERFACE", "UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")
inline fun coockie(block: Cookie.() -> Unit) =
    (js("{}") as Cookie).apply(block)
