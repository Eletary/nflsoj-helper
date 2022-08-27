// ==UserScript==
// @name         NFLSOJ helper
// @namespace    http://www.nfls.com.cn:20035/article/1197
// @version      0.3.2
// @description  Use NFLSOJ More Easily
// @author       lexiyvv & ppip & GlaceonVGC & ACrazySteve
// @match      *://www.nfls.com.cn:20035/*
// @match      *://192.168.188.77/*
// @grant        GM_setClipboard
// ==/UserScript==

function getColor(request) {
    let fir = request.match(/(?<=##)#[0-9a-fA-F]{6}/),
        res = request.match(/(?<=(?<!#)#)#[0-9a-fA-F]{6}/);
    res = res ? res[0] : "black";
    return [fir ? fir[0] : res, res];
}
function genColorHTML(t, data, name, color) {
    return `<${t} ${data}><span style="color:${color[0]}">${name[0]}</span><span style="color:${color[1]};">${name.slice(1)}</span></${t}>`;
}
function getUserIcon(request) {
    let icon = request.match(/##\{(\w+ icon)\}/);
    return icon ? `<i class="${icon[1]}"></i>` : null;
}
let tourist = {"20200131": ["black", "red"], "sszcdjr": ["black", "red"]}, domain = window.location.pathname;
if (!localStorage.getItem("bgurl")) {
    localStorage.setItem("bgurl", "https://cdn.luogu.com.cn/upload/image_hosting/t9gah1kv.png");
}
document.body.style.backgroundImage=`url(${localStorage.getItem("bgurl")})`;
document.body.style.backgroundSize="cover";
if (!localStorage.getItem("fgopacity")) {
    localStorage.setItem("fgopacity", "0.8");
}
document.body.style.opacity = localStorage.getItem("fgopacity");
if (domain == "/") {
    for(var i = 1; i < 40; i += 2) {
        let td = document.getElementsByClassName("ui very basic center aligned table")[0].tBodies[0].childNodes[i], name = td.childNodes[3].innerText;
        td.childNodes[3].innerHTML = genColorHTML(
            "a", `href=${td.childNodes[3].childNodes[0].getAttribute("href")}`, name,
            tourist.hasOwnProperty(name) ? tourist[name] : getColor(td.childNodes[9].textContent));
    }
    let board = document.getElementsByClassName("ui very basic table")[0];
    board.innerHTML += `<text>NFLSOJ helper 公告</text><hr>
                        <a href='/article/1197'>NFLSOJ helper 发布帖</a><hr>
                        <text style='border:1px solid black;border-radius:4px;'>延长登录时间</text>`;
    board.childNodes[9].addEventListener("click", function() {
        document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
        alert("Success");
    });
} else if (/\/user\/[0-9]+(\/(?!edit)|$)/.test(domain)) {
    var imageurl2="https://cdn-userpic.codeforces.com/1199019/title/4dc19a4ef4c17004.jpg";
    document.getElementsByClassName("blurring dimmable image")[0].childNodes[3].src=imageurl2;
    let mainpage = document.getElementsByClassName("ui bottom attached segment"),
        nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML, getColor(mainpage[3].innerHTML)),
        backup = document.getElementsByClassName("icon")[14].outerHTML,
        customIcon = getUserIcon(mainpage[3].innerHTML);
    backup = customIcon ? customIcon : /(man|woman) icon/.test(backup) ? backup : "";
    mainpage[0].innerHTML = nameColor;
    document.getElementsByClassName("header")[1].innerHTML = nameColor + " " + backup;
} else if (/submission(?=[^s])/.test(domain)) {
    let button = document.getElementsByClassName("ui very basic table")[0];
    button.innerHTML += "<button style='width:90px;height:28px;border:1px solid black;border-radius:4px;'>Copy</button>";
    button = button.childNodes[3];
    button.addEventListener("click", function() {
        GM_setClipboard(document.getElementsByClassName("hl-c++")[0].textContent, "text");
        button.textContent = "Copied!";
        setTimeout(function(){button.textContent = "Copy"}, 1000);
    });
}
