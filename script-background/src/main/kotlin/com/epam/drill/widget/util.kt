package com.epam.drill.widget

import com.epam.drill.widget.browser.cookies.*
import com.epam.drill.widget.browser.tabs.QueryInfo
import com.epam.drill.widget.browser.tabs.Tab
import com.epam.drill.widget.browser.tabs.query
import com.epam.drill.widget.browser.tabs.reload
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.await
import org.w3c.dom.url.URL

suspend fun getCookie(cookieName: String): Cookie? {
    val currentURL = getCurrentURL()
    val cookieUrl = "${currentURL.protocol}//${currentURL.host}"
    console.log(cookieUrl)
    return get(cookieSearcher {
        url = cookieUrl
        name = cookieName
    }).await()
}

suspend fun setCookie(cookieName: String, cookieValue: String) {
    val currentURL = getCurrentURL()
    val cookieUrl = "${currentURL.protocol}//${currentURL.host}"
    set(coockie {

        asDynamic().url = cookieUrl
        name = cookieName
        value = cookieValue
    })
}

suspend fun getCurrentURL(): URL {
    return URL(getCurrentTabAddress().await())
}

fun getCurrentTabAddress() =
    GlobalScope.async {
        val queryInfo = QueryInfo {
            active = true
            currentWindow = true
        }
        val tabs = query(queryInfo).await()
        val tab = tabs[0]
        val url = tab.url
        url ?: throw RuntimeException("tab.url should be a string")
    }

fun reloadTab(tabId: Int) {
    reload(tabId, null)
}

suspend fun currentTab(): Tab {
    val queryInfo = QueryInfo {
        active = true
        currentWindow = true
    }
    val tabs = query(queryInfo).await()
    return tabs.first()
}