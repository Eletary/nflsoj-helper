// ==UserScript==
// @name         NFLSOJ helper
// @namespace    https://github.com/NFLSCode/nflsoj-helper
// @version      0.4.2
// @description  Use NFLSOJ More Easily
// @author       lexiyvv & ppip & GlaceonVGC & ACrazySteve
// @match        *://www.nfls.com.cn:20035/*
// @match        *://192.168.188.77/*
// @grant        GM_setClipboard
// @icon         https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/icon.png
// @icon64       https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/icon.png
// ==/UserScript==

var yourProfilePicture = "https://cdn.luogu.com.cn/upload/usericon/150522.png"; // white
function getElement(request) {
    return document.getElementsByClassName(request);
}
function betterBorder(p) {
    p.style.backgroundColor = "rgba(255,255,255)";
    p.style.padding = "14px";
    p.style.border = "thin solid rgba(200,200,200,0.5)";
}
let domain = window.location.pathname;
if (/contests/.test(domain)) {
    betterBorder(getElement("padding")[0].childNodes[1]);
} else if (/submissions|discussion|(contest\/\d+\/(ranklist|repeat))/.test(domain)) {
    betterBorder(getElement("padding")[0].childNodes[3]);
} else if (/cp/.test(domain)) {
    betterBorder(getElement("fixed-table-body")[0]);
}
if (localStorage.getItem("bgurl") && localStorage.getItem("bgurl") != "null") {
    document.body.style.backgroundImage=`url(${localStorage.getItem("bgurl")})`;
}
document.body.style.backgroundSize="cover";
if (!localStorage.getItem("fgopacity")) {
    localStorage.setItem("fgopacity", "0.8");
}
document.body.style.opacity = localStorage.getItem("fgopacity");
function addCopy(button, code) {
    button.addEventListener("click", function() {
        GM_setClipboard(code.textContent, "text"); // eslint-disable-line no-undef
        button.textContent = "Copied!";
        setTimeout(function() {
            button.textContent = "Copy";
        }, 1000);
    })
}
var clickCountForCode = 0;
function formatCode() {
    clickCountForCode+=1;
    let value = getElement("ui existing segment")[0];
    if(clickCountForCode%2===1){
        document.getElementsByClassName("ui existing segment")[0].childNodes[4].firstChild.innerHTML=formattedCode;  // eslint-disable-line no-undef
        value.childNodes[0].childNodes[2].textContent = "显示原始代码";
    }else{
        document.getElementsByClassName("ui existing segment")[0].childNodes[4].firstChild.innerHTML=unformattedCode;  // eslint-disable-line no-undef
        value.childNodes[0].childNodes[2].textContent = "格式化代码";
    }
}
if (!(/login/.test(domain))) {
    if (/^\/submission\/\d+(\/|$)/.test(domain)) {
        let value = getElement("ui existing segment")[0];
        value.firstChild.style.borderRadius = "0 0.28571429rem 0 0";
        value.firstChild.style.position = "unset";
        let position = value.innerHTML.search(/<\/a>/) + 4;
        value.innerHTML = `<span style="position:absolute;top:0px;right:-4px;">
                             <div class="ui button" style="position:relative;left:4px;border-right: 1px solid rgba(0,0,0,0.6);border-radius: 0 0 0 .28571429rem;">
                               Copy
                             </div>${value.innerHTML.slice(0, position)}
                           </span>${value.innerHTML.slice(position)}`;
        addCopy(value.firstChild.childNodes[1], value.lastChild);
        value.childNodes[0].childNodes[2].addEventListener("click", formatCode);
    } else {
        for (let i = 0, e; i < (e = getElement("ui existing segment")).length; i++) {
            if (/\/problem\//.test(domain)) {
                e[i].parentNode.style.width = "50%";
            }
            e[i].innerHTML = `<div class="ui button" style="position:absolute;top:0px;right:-4px;border-top-left-radius:0;border-bottom-right-radius:0;">
                                Copy
                              </div>${e[i].innerHTML}`;
            addCopy(e[i].firstChild, e[i].childNodes[e[i].childNodes.length / 2]);
        }
    }
}
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
if (domain == "/") {
    let tourist = {"20200131": ["black", "red"], "sszcdjr": ["black", "red"]};
    for (var i = 1; i < 40; i += 2) {
        let td = getElement("ui very basic center aligned table")[0].tBodies[0].childNodes[i], name = td.childNodes[3].innerText;
        td.childNodes[3].innerHTML = genColorHTML(
            "a", `href=${td.childNodes[3].childNodes[0].getAttribute("href")}`, name,
            Object.prototype.hasOwnProperty.call(tourist, name) ? tourist[name] : getColor(td.childNodes[9].textContent));
    }
    let col = document.getElementsByClassName("eleven wide column")[0], ind = col.innerHTML.search(/<h4 class="ui top attached block header"><i class="ui signal/);
    col.innerHTML = `${col.innerHTML.slice(0, ind)}
    <h4 class="ui top attached block header"><img src="https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/icon.png" style="width:1.18em;height:1em;" />NFLSOJ Helper控制台</h4>
    <div class="ui bottom attached segment">
        官网链接：
        <a class="ui button" style="position:relative;left:0px;" href='https://github.com/NFLSCode/nflsoj-helper/'>
            转到 NFLSOJ Helper 官方主页
        </a>
        <hr />
        主要功能：
        <span class="ui button" style="position:relative;left:0px;" id="aaa">延长登录时间</span>
        <span class="ui button" style="position:relative;left:0px;" id="bbb">更换背景</span>
    </div>
    ${col.innerHTML.slice(ind)}`;
    document.getElementById("aaa").addEventListener("click", function() {
        document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
        alert("Success");
    });
    document.getElementById("bbb").addEventListener("click", function() {
        localStorage.setItem("bgurl", prompt("请输入背景链接，想删除背景选择“取消”，默认图片由GlaceonVGC提供",
                                             "https://raw.githubusercontent.com/LazoCoder/Pokemon-Terminal/master/pokemonterminal/Images/Generation%20IV%20-%20Sinnoh/471.jpg"));
        alert("Success");
        document.body.style.backgroundImage=`url(${localStorage.getItem("bgurl")})`;
    });
    document.getElementsByTagName("ul")[0].innerHTML = `
    <li><a href="http://www.51nod.com">51Nod</a></li>
    <li><a href="http://acdream.info">ACdream</a></li>
    <li><a href="http://judge.u-aizu.ac.jp">Aizu</a></li>
    <li><a href="https://atcoder.jp">AtCoder</a></li>
    <li><a href="https://www.acmicpc.net">Baekjoon</a></li>
    <li><a href="http://codeforces.com/gyms/">CF::Gym</a></li>
    <li><a href="http://www.codechef.com">CodeChef</a></li>
    <li><a href="http://codeforces.com">CodeForces</a></li>
    <li><a href="https://cses.fi/problemset">CSEG</a></li>
    <li><a href="https://cpc.csgrandeur.cn">CSG</a></li>
    <li><a href="http://acm.csu.cn/OnlineJudge">CSU</a></li>
    <li><a href="https://dmoj.ca">DMOJ</a></li>
    <li><a href="https://www.e-olymp.com/en/">E-Olymp</a></li>
    <li><a href="http://acm.mipt.ru/judge/">EIJudge</a></li>
    <li><a href="http://acm.fzu.edu.cn">FZU</a></li>
    <li><a href="https://florr.io">FlorrIO</a></li>
    <li><a href="https://www.hackerrank.com">HackerRank</a></li>
    <li><a href="http://acm.hdu.edu.cn">HDU</a></li>
    <li><a href="https://darkbzoj.cc">黑暗爆炸</a></li>
    <li><a href="https://hihocoder.com">HihoCoder</a></li>
    <li><a href="http://acm.hit.edu.cn/hoj/">HIT</a></li>
    <li><a href="http://acm.hrbust.edu.cn">HRBUST</a></li>
    <li><a href="http://www.hustoj.org">HUST</a></li>
    <li><a href="http://www.lydsy.com/JudgeOnline/">HYSBZ</a></li>
    <li><a href="https://nanti.jisuanke.com">计蒜客</a></li>
    <li><a href="https://open.kattis.com">Kattis</a></li>
    <li><a href="https://loj.ac">LibreOJ</a></li>
    <li><a href="http://lightoj.com">LightOJ</a></li>
    <li><a href="https://luogu.com.cn/">洛谷</a></li>
    <li><a href="https://ac.2333.moe">NBUT</a></li>
    <li><a href="http://openjudge.cn">OpenJudge</a></li>
    <li><a href="http://qoj.ac">QOJ</a></li>
    <li><a href="http://cstests.scu.edu.cn">SCU</a></li>
    <li><a href="https://codeforces.com/problemsets/acmsguru/">SGU</a></li>
    <li><a href="http://www.spoj.com">SPOJ</a></li>
    <li><a href="https://arena.topcoder.com">TopCoder</a></li>
    <li><a href="https://toph.co">Toph</a></li>
    <li><a href="https://github.com/HeRaNO/cdoj-vjudge/wiki">UESTC</a></li>
    <li><a href="https://uoj.ac">UniversalOJ</a></li>
    <li><a href="http://acm.timus.ru">URAL</a></li>
    <li><a href="https://onlinejudge.org/">UVA</a></li>
    <li><a href="http://livearchive.onlinejudge.org/index.php">UVALive</a></li>
    <li><a href="http://www.codah.club">Z-Trening</a></li>
    <li><a href="http://acm.zju.edu.cn/onlinejudge/">ZOJ</a></li>
    `;
} else if (/^\/user\/\d+(\/|$)/.test(domain)) {
    let imageurl = yourProfilePicture, imgPath = getElement("blurring dimmable image")[0].childNodes[3];
    if (imgPath) {
        imgPath.src=imageurl;
    }
    let mainpage = getElement("ui bottom attached segment"),
        nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML, getColor(mainpage[3].innerHTML)),
        backup = getElement("icon")[14].outerHTML, customIcon = getUserIcon(mainpage[3].innerHTML);
    mainpage[0].innerHTML = nameColor;
    getElement("header")[1].innerHTML = nameColor + " " + (customIcon ? customIcon : /(man|woman) icon/.test(backup) ? backup : "");
}
