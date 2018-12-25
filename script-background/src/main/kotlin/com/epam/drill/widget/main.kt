@file:Suppress("UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")

package com.epam.drill.widget

import com.epam.drill.widget.browser.browseraction.browserAction
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlin.browser.document

fun main(args: Array<String>) {
    document.onContentLoadedEventAsync {
        browserAction.onClicked.addListener {
            GlobalScope.launch {
                val isEnable = getCookie("DrillEnable")?.value?.toBoolean() ?: false
                setCookie("DrillEnable", (!isEnable).toString())
                reloadTab(currentTab().id)
            }
        } as Unit

    }
}

