// ==UserScript==
// @name         NFLSOJ helper
// @namespace    http://www.nfls.com.cn:20035/article/1197
// @version      0.3.2
// @description  Use NFLSOJ More Easily
// @author       lexiyvv & ppip
// @match      *://www.nfls.com.cn:20035/*
// @match      *://192.168.188.77/*
// @grant        GM_setClipboard
// ==/UserScript==

function getColor(request) {
    var fir = request.match(/(?<=##)#[0-9a-fA-F]{6}/), res = request.match(/(?<=(?<!#)#)#[0-9a-fA-F]{6}/);
    res = res ? res[0] : "black";
    return [fir ? fir[0] : res, res];
}
function genColorHTML(t, data, name) {
    return function(color) {
        return `<${t} ${data} style="color:${color[0]};">${name[0]}</${t}><${t} ${data} style="color:${color[1]};">${name.slice(1)}</${t}>`;
    };
}
function getUserIcon(request) {
    var icon = request.match(/##\{(\w+ icon)\}/);
    return icon ? `<i class="${icon[1]}"></i>` : null;
}
(function() {
    'use strict';
    var domain = window.location.pathname;
    if (domain == "/") {
        for(var i = 1; i < 40; i += 2) {
            var td = document.getElementsByClassName("ui very basic center aligned table")[0].tBodies[0].childNodes[i];
            var name = td.childNodes[3].innerText,
                sign = td.childNodes[9].textContent,
                result = genColorHTML("a", `href=${td.childNodes[3].childNodes[0].getAttribute("href")}`, name);
            let tourist = ["20200131", "sszcdjr"];
            td.childNodes[3].innerHTML = tourist.includes(name) ? result(["black", "red"]) : result(getColor(sign));
        }
        var board = document.getElementsByClassName("ui very basic table")[0];
        board.innerHTML += "<text>NFLSOJ helper 公告</text><hr>"
                         + "<a href='/article/1197'>NFLSOJ helper 发布帖</a><hr>"
                         + "<text style='border:1px solid black;border-radius:4px;'>延长登录时间</text>";
        board.childNodes[9].addEventListener("click", function() {
            document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
            alert("Success");
        });
    } else if (/\/user\/[0-9]+(\/(?!edit)|$)/.test(domain)) {
        var mainpage = document.getElementsByClassName("ui bottom attached segment"),
            nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML)(getColor(mainpage[3].innerHTML)),
            backup = document.getElementsByClassName("icon")[14].outerHTML, customIcon = getUserIcon(mainpage[3].innerHTML);
        backup = customIcon ? customIcon : /(man|woman) icon/.test(backup) ? backup : "";
        mainpage[0].innerHTML = nameColor;
        document.getElementsByClassName("header")[1].innerHTML = nameColor + " " + backup;
    } else if (/submission(?=[^s])/.test(domain)) {
        var button = document.getElementsByClassName("ui very basic table")[0];
        button.innerHTML += "<button style='width:90px;height:28px;border:1px solid black;border-radius:4px;'>Copy</button>";
        button = button.childNodes[3];
        button.addEventListener("click", function() {
            var s = document.getElementsByClassName("hl-c++")[0].textContent;
            GM_setClipboard(s, "text");
            button.textContent = "Copied!";
            setTimeout(function(){button.textContent = "Copy"}, 1000);
        });
    }
})();
