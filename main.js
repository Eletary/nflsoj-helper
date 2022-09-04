// ==UserScript==
// @name         NFLSOJ Helper
// @namespace    https://github.com/NFLSCode/nflsoj-helper
// @version      VERSION
// @description  Use NFLSOJ More Easily
// @author       lexiyvv & ppip & GlaceonVGC & ACrazySteve
// @match        *://www.nfls.com.cn:20035/*
// @match        *://192.168.188.77/*
// @require      http://www.nfls.com.cn:20035/cdnjs/jquery/3.3.1/jquery.min.js
// @require      http://www.nfls.com.cn:20035/cdnjs/blueimp-md5/2.10.0/js/md5.min.js
// @grant        GM_setClipboard
// @icon         https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/images/icon.png
// @icon64       https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/images/icon.png
// ==/UserScript==

const domain = window.location.pathname, repo = "NFLSCode/nflsoj-helper"; // white
function GET(url) {
    let result;
    $.ajax({async: false, type: "GET", url: url, success: function(msg){result = msg;}}); // eslint-disable-line no-undef
    return result;
}
function getDOM(href) {
    return new DOMParser().parseFromString(GET(href), "text/html");
}
function getElement(request) {
    return document.getElementsByClassName(request);
}
/******************** totalstyle module ********************/
function betterBorder(p) {
    p.style.backgroundColor = "rgba(255,255,255)";
    p.style.padding = "14px";
    p.style.border = "thin solid rgba(200,200,200,0.5)";
}
if (/contests|practices/.test(domain)) {
    betterBorder(getElement("padding")[0].children[0]);
} else if (/submissions|\d+\/ranklist|repeat|discussion/.test(domain)) {
    betterBorder(getElement("padding")[0].children[1]);
} else if (/cp/.test(domain)) {
    betterBorder(getElement("fixed-table-body")[0]);
}
if (String(localStorage.getItem("bgurl")) != "null") {
    document.body.style.backgroundImage=`url(${localStorage.getItem("bgurl")})`;
}
document.body.style.backgroundSize = "cover";
if (!localStorage.getItem("fgopacity")) localStorage.setItem("fgopacity", "0.8");
document.body.style.opacity = localStorage.getItem("fgopacity");
Array.from(getElement("ui comments")).forEach(function(value) {
    value.style.backgroundColor = "#fff";
    value.style.padding = "1em";
    value.style.borderRadius = "0.28571429rem";
    value.style.boxShadow = "0 1px 2px 0 rgb(34 36 38 / 15%)";
    value.style.border = "1px solid rgba(34,36,38,.15)";
});
/******************** copy module ********************/
function addCopy(button, code) {
    button.addEventListener("click", function() {
        GM_setClipboard(code.textContent, "text"); // eslint-disable-line no-undef
        button.textContent = "Copied!";
        setTimeout(function(){button.textContent = "Copy";}, 1000);
    })
}
let clickCountForCode = 0;
function formatCode() {
    clickCountForCode ^= 1;
    let value = getElement("ui existing segment")[0];
    value.children[1].firstChild.innerHTML = clickCountForCode ? formattedCode : unformattedCode; // eslint-disable-line no-undef
    value.children[0].children[1].textContent = clickCountForCode ? "显示原始代码" : "格式化代码";
}
if (!(/login/.test(domain))) {
    if (/^\/submission\/\d+(\/|$)/.test(domain)) {
        let value = getElement("ui existing segment")[0];
        value.firstChild.style.borderRadius = "0 .28571429rem 0 0";
        value.firstChild.style.position = "unset";
        let position = value.innerHTML.search(/<\/a>/) + 4;
        value.innerHTML = `<span style="position:absolute;top:0px;right:-4px;">
                             <div class="ui button" style="position:relative;left:4px;border-right:1px solid rgba(0,0,0,0.6);border-radius:0 0 0 .28571429rem;">
                               Copy
                             </div>${value.innerHTML.slice(0, position)}
                           </span>${value.innerHTML.slice(position)}`;
        addCopy(value.firstChild.children[0], value.lastChild);
        value.children[0].children[1].addEventListener("click", formatCode);
        } else {
        for (let i = 0, e; i < (e = getElement("ui existing segment")).length; i++) {
            e[i].innerHTML += `<div class="ui button" style="position:absolute;top:0px;right:-4px;border-top-left-radius:0;border-bottom-right-radius:0;">
                                 Copy</div>`;
            if (/\/problem\//.test(domain)) e[i].parentNode.style.width = "50%";
            else if (e[i].firstChild.localName != "pre") {
                let href = domain.match(/\/article\/\d+/)[0];
                if (href) addCopy(e[i].lastChild, getDOM(window.location.origin + href + "/edit").getElementById("content"));
                continue;
            }
            addCopy(e[i].lastChild, e[i].childNodes[0]);
        }
    }
}
/******************** userstyle module ********************/
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
    let icon = request.match(/##\{([\s\S]+ icon)\}/);
    return icon ? `<i class="${icon[1]}"></i>` : null;
}
if (/^\/user\/\d+(\/[^e]|$)/.test(domain)) {
    let mainpage = getElement("ui bottom attached segment");
    for (let i = 0; i < mainpage.length; ++i) {
        if (mainpage[i].parentNode.innerText.includes("Email")) {
            document.getElementsByTagName("img")[0].src = `https://cn.gravatar.com/avatar/${md5(mainpage[i].innerText)}?s=324.183`; // eslint-disable-line no-undef
        }
    }
    let nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML, getColor(mainpage[3].innerHTML)),
        backup = getElement("icon")[14].outerHTML, customIcon = getUserIcon(mainpage[3].innerHTML);
    mainpage[0].innerHTML = nameColor;
    getElement("header")[1].innerHTML = nameColor + " " + (customIcon ? customIcon : /(man|woman) icon/.test(backup) ? backup : "");
} else if (domain == "/") {
    let tourist = {"20200131": ["black", "red"], "sszcdjr": ["black", "red"], "Kevin090228" : ["black", "red"]};
    for (let i = 0; i < 20; ++i) {
        let td = getElement("ui very basic center aligned table")[0].tBodies[0].children[i], name = td.children[1].innerText;
        td.children[1].innerHTML = genColorHTML(
            "a", `href=${td.children[1].children[0].getAttribute("href")}`, name,
            Object.prototype.hasOwnProperty.call(tourist, name) ? tourist[name] : getColor(td.childNodes[9].textContent));
    }
}
/******************** rating module ********************/
function getEloWinProbability(ra, rb) {
    return 1.0 / (1 + Math.pow(10, (rb - ra) / 400.0));
}
function getContestantSeed(contestantIndex, allContestants) {
    let seed = 1;
    let rating = allContestants[contestantIndex].currentRating;
    for (let i = 0; i < allContestants.length; i++) {
        if (contestantIndex != i) {
            seed += getEloWinProbability(allContestants[i].currentRating, rating);
        }
    }
    return seed;
}
function sum(arr) {
    let s = 0;
    for (let ind in arr) s += arr[ind];
    return s;
}
function getRatingSeed(rating, allContestants) {
    return 1 + sum(allContestants.map(c => getEloWinProbability(c.currentRating, rating)));
}
function getAverageRank(contestant, allContestants) {
    const realRank = allContestants[contestant].rank;
    const expectedRank = getContestantSeed(contestant, allContestants);
    const average = Math.sqrt(realRank * expectedRank);
    return average;
}
function getRatingToRank(contestantIndex, allContestants) {
    let averageRank = getAverageRank(contestantIndex, allContestants);
    let left = 1;// contestant.getPrevRating() - 2 * minDelta;
    let right = 8000;// contestant.getPrevRating() + 2 * maxDelta;
    while (right - left > 1) {
        const mid = (left + right) / 2;
        const seed = getRatingSeed(mid, allContestants);
        if (seed < averageRank) right = mid;
        else left = mid;
    }
    return left;
}
function calcRating(allContestants) {
    let deltas = [];
    const numberOfContestants = allContestants.length;
    for (let i = 0; i < allContestants.length; i++) {
        const expR = getRatingToRank(i, allContestants);
        deltas[i] = ((expR - allContestants[i].currentRating) / 2);
    }
    const deltaSum = sum(deltas);
    const inc = -deltaSum / numberOfContestants - 1;
    deltas = deltas.map(d => d + inc);
    const zeroSumCount = Math.min(Math.trunc(4 * Math.round(Math.sqrt(numberOfContestants))), numberOfContestants);
    const deltaSum2 = sum(deltas.slice(0, zeroSumCount));
    const inc2 = Math.min(Math.max(-deltaSum2 / zeroSumCount, -10), 0);
    deltas = deltas.map(d => d + inc2);
    return allContestants.map((contestant, i) => ({rank: deltas[i], currentRating: contestant.currentRating + deltas[i]}));
}
async function Rating() {
    if (document.getElementsByTagName("thead")[0].rows[0].innerHTML.includes("<th>Rating(Δ)</th>")) return ;
    const hisRating = getElement("ui center aligned header")[0].innerText + `<\\/td>[\\s\\S]*?(<td>\\d{4}[\\s\\S]*?<\\/td>)`,
          curRating = /<i class="star icon"><\/i>积分 (\d+)/;
    let arr = document.getElementsByTagName("tbody")[0].rows, c = Array.from({length: arr.length}, (v, i) => i);
    if (GET(arr[0].innerHTML.match(/\/user\/\d+/)[0]).match(hisRating) != null) {
        let requests = c.map((i) => async function() {
            let res;
            await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0], function(p) {res = p.match(hisRating)[1];}); // eslint-disable-line no-undef
            return res;
        }());
        c = await Promise.all(requests);
    } else {
        let requests = c.map((i) => async function() {
            let res = {};
            await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0], function(p) {res.currentRating = parseInt(p.match(curRating)[1])}); // eslint-disable-line no-undef
            res.rank = arr[i].children[0].innerText;
            return res;
        }());
        c = calcRating(await Promise.all(requests));
        for (let i = 0; i < arr.length; ++i) {
            let n = Math.round(c[i].rank);
            c[i] = `<td>${Math.round(c[i].currentRating)}<span class="rating_${n>=0?"up":"down"}">(${(n<0?"":"+")+n})</span></td>`;
        }
    }
    document.getElementsByTagName("thead")[0].rows[0].innerHTML += "<th>Rating(Δ)</th>";
    for (let i = 0; i < arr.length; ++i) {
        arr[i].innerHTML += c[i];
    }
}
/******************** rank module ********************/
if (/\d+\/(ranklist|repeat)/.test(domain)) {
    setTimeout(async function() {
        let head = document.getElementsByTagName("tr")[0], pos = /ranklist/.test(domain) ? head.innerHTML.indexOf("</th>") + 5 : 0;
        if (head.innerHTML.indexOf("用户名") == -1) {
            let arr = document.getElementsByTagName("tbody")[0].rows;
            let name = Array.from({length: arr.length}, (v, i) => i);
            let requests = name.map((i) => async function() {
                let res;
                await $.get(arr[i].innerHTML.match(/\/submission\/\d+/)[0], function(raw) { // eslint-disable-line no-undef
                    res = `<td><a href="/user/${raw.match(/"userId":(\d+)/)[1]}">${raw.match(/"user":"([\s\S]+?)"/)[1]}</a></td>`;
                });
                return res;
            }());
            name = await Promise.all(requests);
            head.innerHTML = head.innerHTML.slice(0, pos) + "<th>用户名</th>" + head.innerHTML.slice(pos);
            for (let i = 0; i < arr.length; ++i) {
                let pos = /ranklist/.test(domain) ? arr[i].innerHTML.indexOf("</td>") : 0;
                arr[i].innerHTML = arr[i].innerHTML.slice(0, pos) + name[i] + arr[i].innerHTML.slice(pos);
            }
        }
        if (/ranklist/.test(domain)) {
            getElement("padding")[0].innerHTML = `<span class="ui mini right floated labeled icon button" id="rating" style="top:6px"><i class="calculator icon"></i>Predictor</span>`
                                               + getElement("padding")[0].innerHTML;
            document.getElementById("rating").addEventListener("click", Rating);
        }
    }, 0);
}
/******************** dashboard ********************/
if (domain == "/") {
    let col = getElement("eleven wide column")[0], ind = col.innerHTML.search(/<h4 class="ui top attached block header"><i class="ui signal/);
    col.innerHTML = col.innerHTML.slice(0, ind) + `
    <h4 class="ui top attached block header">
      <img src="https://raw.githubusercontent.com/${repo}/master/images/icon.png" style="width:20px;height:20px;">
      NFLSOJ Helper控制面板
    </h4>
    <div class="ui bottom attached segment">
      <table class="ui very basic table" style="table-layout: fixed;">
        <tr><td>
          <h4 style="display:inline;">官网链接</h4>
          <a class="ui blue button" href="https://github.com/${repo}/">
            <i class="ui linkify icon"></i>
            转到 NFLSOJ Helper 官方主页
          </a>
          <a class="ui green button" id="l1">
            <i class="repeat icon"></i>获取最新版
          </a>
        </td></tr>
        <tr><td>
          <h4 style="display:inline;">主要功能</h4>
          <a class="ui button" id="f1">
            <i class="code icon"></i>延长登录时间
          </a><a class="ui button" id="f2">
            <i class="code icon"></i>更换背景
          </a>
        </td></tr>
      </table>
    </div>` + col.innerHTML.slice(ind);
    document.getElementById("l1").addEventListener("click", function() {
        window.location.href = `https://github.com/${repo}/releases/download/${GET(`https://api.github.com/repos/${repo}/releases/latest`).tag_name}/nflsoj-helper.min.user.js`;
    });
    document.getElementById("f1").addEventListener("click", function() {
        document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
        alert("Success");
    });
    document.getElementById("f2").addEventListener("click", function() {
        localStorage.setItem("bgurl", prompt("请输入背景链接，想删除背景选择“取消”，默认图片由GlaceonVGC提供", `https://raw.githubusercontent.com/${repo}/master/images/471.jpg`));
        document.body.style.backgroundImage = `url(${localStorage.getItem("bgurl")})`;
        alert("Success");
    });
}