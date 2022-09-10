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
// @grant        GM_info
// @icon         https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/images/icon.png
// @icon64       https://raw.githubusercontent.com/NFLSCode/nflsoj-helper/master/images/icon.png
// ==/UserScript==
/* global $ */

const domain = window.location.pathname, repo = "NFLSCode/nflsoj-helper";
async function getDOM(href) {
    return new DOMParser().parseFromString(await $.get(href), "text/html");
}
function getElement(request) {
    return document.getElementsByClassName(request);
}
if (domain == "/") document.body.innerHTML = document.body.innerHTML.replaceAll("<!--", "").replaceAll("-->", "");
/******************** userfind module ********************/
getElement("right floated five wide column")[0].children[0].innerHTML = `<i class="search icon"></i>查找用户`;
getElement("right floated five wide column")[0].children[1].innerHTML = `
          <div class="ui search focus" style="width: 100%; ">
            <div class="ui left icon input" style="width: 100%; ">
              <input class="prompt" style="width: 100%; " type="text" placeholder="ID / 用户名 …">
              <i class="search icon"></i>
            </div>
            <div class="results" style="width: 100%; "></div>
          </div>`;
let script = document.createElement("script");
script.innerHTML = `
$(function () {
  $('.ui.search').search({
    debug: true,
    apiSettings: {
      url: '/api/v2/search/users/{query}',
      cache: false
    },
    fields: {
      title: 'name'
    }
  });
});`;
getElement("right floated five wide column")[0].appendChild(script);
/******************** subscribe module ********************/
function versionCompare(sources, dests) {
    sources = sources.split('.');
    dests = dests.split('.');
    let maxL = Math.max(sources.length, dests.length);
    for (let i = 0; i < maxL; ++i) {
        let preValue = sources.length > i ? sources[i]: 0,
            preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue),
            lastValue = dests.length > i ? dests[i] : 0,
            lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue);
        if (preNum < lastNum) return false;
        if (preNum > lastNum) return true;
    }
    return false;
}
if (domain == "/" && localStorage.getItem("disable_auto_update") != "Y") {
    let today = new Date(Date.now()).toDateString();
    if (localStorage.getItem("last_updated") != today) {
        setTimeout(async () => {
            let latest = (await $.get(`https://api.github.com/repos/${repo}/releases/latest`)).tag_name;
            if (versionCompare(latest.slice(1), GM_info.script.header.match(/@version +([^\n]+)\n/)[1]) && confirm(`检测到新版本 ${latest}，是否更新？`)) { // eslint-disable-line no-undef
                window.location.href = `https://github.com/${repo}/releases/download/${latest}/nflsoj-helper.min.user.js`;
            }
        }, 0);
        localStorage.setItem("last_updated", today);
    }
}
/******************** totalstyle module ********************/
function betterBorder(p) {
    p.style.cssText += "backgroundColor:#fff;padding:14px;border:thin solid rgba(200,200,200,0.5)";
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
Array.from(getElement("ui comments")).forEach((value) => {
    value.style.cssText += "background-color:#fff;padding:1em;border-radius:0.285714rem;box-shadow:0 1px 2px 0 rgb(34 36 38 / 15%);border:1px solid rgba(34,36,38,.15);";
});
/******************** discuss module ********************/
function articleAddCopy(button, code) {
    button.addEventListener("click", () => {
        GM_setClipboard(code.textContent, "text"); // eslint-disable-line no-undef
        button.lastChild.textContent = "复制成功!";
        setTimeout(() => {button.lastChild.textContent = "复制";}, 1000);
    })
}
if (/^\/article\/\d+(?!\/edit)/.test(domain)) {
    let href = domain.match(/\/article\/\d+/)[0];
    let article = await getDOM(href + "/edit");
    if (document.body.innerHTML.includes("您没有权限进行此操作。")) {
        getElement("ui main container")[0].innerHTML = `
        <div class="padding"><div class="ui breadcrumb">
            <div class="section">讨论</div>
              <i class="right angle icon divider"></i>
              <div class="section">Helper Discuss Show</div>
            </div>
            <h1>${article.getElementById("title").value}</h1>
 	        <p style="margin-bottom: -5px; ">
	          <img style="vertical-align: middle; margin-bottom: 2px; margin-right: 2px; " src="https://raw.githubusercontent.com/${repo}/master/images/icon.png" width="17" height="17">
	          <b style="margin-right: 30px; "><a class="black-link">nflsoj-helper</a></b>
	          <b style="margin-right: 30px; "><i class="calendar icon"></i> 2077-08-04 1:00:00</b>
            </p>
            <div class="ui existing segment">
	          <div id="content" class="font-content"><div style="position: relative; overflow: hidden; transform: translate3d(0, 0, 0); ">
                ${await $.post("http://www.nfls.com.cn:20035/api/v2/markdown","s="+article.getElementById("content").value.replaceAll("+", "%2B"))}
              </div>
            </div>
        </div></div>`;
        document.title = article.getElementById("title").value + " - NFLSOJ";
    }
    let ownDiscuss = getElement("ui mini right floated labeled icon button")[1],
        articleCopy = ownDiscuss ? ownDiscuss.parentNode : getElement("padding")[0].children[2];
    articleCopy.innerHTML += `<a style="margin-top:-4px;${ownDiscuss ? "margin-right:3px;" : ""}" class="ui mini orange right floated labeled icon button">
                                <i class="ui copy icon"></i>复制</a>`;
    articleAddCopy(articleCopy.lastChild, article.getElementById("content"));
}
/******************** copy module ********************/
function addCopy(button, code) {
    button.addEventListener("click", () => {
        GM_setClipboard(code.textContent, "Copy"); // eslint-disable-line no-undef
        button.textContent = "Copied!";
        setTimeout(() => {button.textContent = "Copy";}, 1000);
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
            if (/\/problem\//.test(domain)) e[i].parentNode.style.width = "50%";
            else if (e[i].firstChild.localName != "pre") continue;
            e[i].innerHTML += `<div class="ui button" style="position:absolute;top:0px;right:-4px;border-top-left-radius:0;border-bottom-right-radius:0;">
                                 Copy</div>`;
            addCopy(e[i].lastChild, e[i].childNodes[0]);
        }
    }
}
/******************** userstyle module ********************/
function genColorHTML(t, data, name, color) {
    return `<${t} ${data}><span style="color:${color[0]}">${name[0]}</span><span style="color:${color[1]};">${name.slice(1)}</span></${t}>`;
}
async function getUserConfig(domain) {
    let doc = await getDOM(domain), backup = doc.getElementsByClassName("icon")[13].classList.value, config = {
        nameColor: ["black", "black"],
        userIcon: /(man|woman) icon/.test(backup) ? backup : ""
    }
    let discuss = doc.body.innerHTML.match(/<td><a href="(\/article\/\d+)">\$helper.config<\/a><\/td>/);
    if (discuss) {
        discuss = JSON.parse((await getDOM(discuss[1] + "/edit")).getElementById("content").textContent);
        for (let key in discuss) config[key] = discuss[key];
    }
    return config;
}
if (/^\/user\/\d+(\/[^e]|$)/.test(domain)) {
    let config = await getUserConfig(domain);
    let mainpage = getElement("ui bottom attached segment");
    for (let i = 0; i < mainpage.length; ++i) {
        if (mainpage[i].parentNode.innerText.includes("Email")) {
            document.getElementsByTagName("img")[0].src = `https://cn.gravatar.com/avatar/${md5(mainpage[i].innerText)}?s=324.183`; // eslint-disable-line no-undef
        }
    }
    let nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML, config.nameColor), customIcon = `<i class="${config.userIcon}"></i>`;
    mainpage[0].innerHTML = nameColor;
    getElement("header")[1].innerHTML = nameColor + " " + customIcon;
} else if (domain == "/") {
    setTimeout(async () => {
        let rank = getElement("ui very basic center aligned table")[0].tBodies[0].children;
        for (let i = 0; i < rank.length; ++i) window.eval(rank[i].childNodes[9].children[0].innerHTML); // eslint-disable-line no-eval
        getElement("ui very basic center aligned table")[0].tHead.children[0].children[1].style.width = "170px";
        getElement("ui very basic center aligned table")[0].tHead.children[0].innerHTML += "<th>个性签名</th>";
        let res = await Promise.all(Array.from({length: rank.length}, (v, i) => rank[i]).map(async td => {
                const href = td.children[1].children[0].getAttribute("href"), name = td.children[1].innerText;
                td.children[1].innerHTML = genColorHTML("a", `href=${href}`, name, ["black", "black"]);
                let config = await getUserConfig(href);
                return genColorHTML("a", `href=${href}`, name, config.nameColor);
            }));
        for (let i = 0; i < rank.length; ++i) rank[i].children[1].innerHTML = res[i];
    }, 0);
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
    c = (await $.get(arr[0].innerHTML.match(/\/user\/\d+/)[0])).match(hisRating) != null
        ? await Promise.all(c.map(async i => (await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0])).match(hisRating)[1]))
        : calcRating(await Promise.all(c.map(async i => ({
            rank: arr[i].children[0].innerText,
            currentRating: parseInt((await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0])).match(curRating)[1])
        })))).map(p => {
            let n = Math.round(p.rank);
            return `<td>${Math.round(p.currentRating)}<span class="rating_${n >= 0 ? "up" : "down"}">(${(n < 0 ? "" : "+") + n})</span></td>`;
        });
    document.getElementsByTagName("thead")[0].rows[0].innerHTML += "<th>Rating(Δ)</th>";
    for (let i = 0; i < arr.length; ++i) {
        arr[i].innerHTML += c[i];
    }
}
/******************** rank module ********************/
if (/\d+\/(ranklist|repeat)/.test(domain)) {
    let head = document.getElementsByTagName("tr")[0], pos = /ranklist/.test(domain) ? head.innerHTML.indexOf("</th>") + 5 : 0;
    if (head.innerHTML.indexOf("用户名") == -1) {
        let arr = document.getElementsByTagName("tbody")[0].rows;
        let name = await Promise.all(Array.from({length: arr.length}, (v, i) => i).map(async (i) => {
            let raw = await $.get(arr[i].innerHTML.match(/\/submission\/\d+/)[0]);
            return `<td><a style="color:black;"href="/user/${raw.match(/"userId":(\d+)/)[1]}">${raw.match(/"user":"([\s\S]+?)"/)[1]}</a></td>`;
        }));
        head.innerHTML = head.innerHTML.slice(0, pos) + "<th>用户名</th>" + head.innerHTML.slice(pos);
        for (let i = 0; i < arr.length; ++i) {
            let pos = /ranklist/.test(domain) ? arr[i].innerHTML.indexOf("</td>") : 0;
            arr[i].innerHTML = arr[i].innerHTML.slice(0, pos) + name[i] + arr[i].innerHTML.slice(pos);
        }
    }
    if (/ranklist/.test(domain)) {
        getElement("padding")[0].innerHTML =
              `<span class="ui mini right floated labeled blue icon button" id="rating" style="top:6px;"><i class="calculator icon" id=calc></i>Predict Rating</span>`
            + getElement("padding")[0].innerHTML;
        document.getElementById("rating").addEventListener("click", async () => {
            getElement("padding")[0].children[0].childNodes[1].innerText = "Please Wait...";
            await Rating();
            getElement("padding")[0].children[0].childNodes[1].innerText = "Done!";
        });
    }
}
/******************** dashboard ********************/
if (domain == "/") {
    let col = getElement("eleven wide column")[0], ind = col.innerHTML.search(/<h4 class="ui top attached block header"><i class="ui signal/);
    col.innerHTML = col.innerHTML.slice(0, ind) + `
    <h4 class="ui top attached block header">
      <img src="https://raw.githubusercontent.com/${repo}/master/images/icon.png" style="width:20px;height:20px;position:relative;top:-3px;">
      NFLSOJ Helper 控制面板
    </h4>
    <div class="ui bottom attached segment">
      <table class="ui very basic table" style="table-layout: fixed;">
        <tr><td>
          <h4 style="display:inline;">更新提醒</h4>
          <span class="ui toggle checkbox" style="position:relative;left:20px;top:4px;">
            <input id="l1" type="checkbox" ${localStorage.getItem("disable_auto_update") == "Y" ? "" : "checked"}>
            <label>  </label>
          </span>
        </td></tr>
        <tr><td>
          <h4 style="display:inline;">官网链接</h4>
          <a class="ui blue button" style="position:relative;left:20px;" href="https://github.com/${repo}/">
            <i class="ui linkify icon"></i>转到 NFLSOJ Helper 官方主页
          </a><a class="ui green button" id="l2" style="position:relative;left:20px;">
            <i class="repeat icon"></i>获取最新版
          </a>
        </td></tr>
        <tr><td>
          <h4 style="display:inline;">主要功能</h4>
          <a class="ui button" id="f1" style="position:relative;left:20px;">
            <i class="code icon"></i>延长登录时间
          </a><a class="ui button" id="f2" style="position:relative;left:20px;">
            <i class="code icon"></i>更换背景
          </a>
        </td></tr>
      </table>
    </div>` + col.innerHTML.slice(ind);
    document.getElementById("l1").addEventListener("click", () => {
        localStorage.setItem("disable_auto_update", document.getElementById("l1").checked ? "N" : "Y");
        if (document.getElementById("l1").checked) localStorage.removeItem("last_updated");
    });
    document.getElementById("l2").addEventListener("click", async () => {
        window.location.href = `https://github.com/${repo}/releases/download/${(await $.get(`https://api.github.com/repos/${repo}/releases/latest`)).tag_name}/nflsoj-helper.min.user.js`; // eslint-disable-line no-undef
    });
    document.getElementById("f1").addEventListener("click", () => {
        document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
        alert("Success");
    });
    document.getElementById("f2").addEventListener("click", () => {
        localStorage.setItem("bgurl", prompt("请输入背景链接，想删除背景选择“取消”，默认图片由GlaceonVGC提供", `https://raw.githubusercontent.com/${repo}/master/images/471.jpg`));
        document.body.style.backgroundImage = `url(${localStorage.getItem("bgurl")})`;
        alert("Success");
    });
}