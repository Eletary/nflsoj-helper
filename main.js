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
/* eslint-disable no-undef */
/* eslint-disable curly */

const domain = window.location.pathname, repo = "NFLSCode/nflsoj-helper";
async function getDOM(href) {
    return new DOMParser().parseFromString(await $.get(href), "text/html");
}
/******************** contest module ********************/
if (document.body.innerHTML.includes("我的比赛")) $(".menu")[1].innerHTML += `<a class="item" href="/dp/"><i class="tasks icon"></i>总结</a>`;
if (/contest\/\d+(?!\d|\/[a-z])/.test(domain)) document.body.innerHTML = document.body.innerHTML.replaceAll("<!--", "").replaceAll("-->", "");
/******************** search module ********************/
function genSearchBox(use, id, holder, api) {
    return [`
    <h4 class="ui top attached block header"><i class="search icon"></i>${use}</h4>
    <div class="ui bottom attached segment">
      <div class="ui search focus" id="${id}" style="width: 100%; ">
        <div class="ui left icon input" style="width: 100%; ">
          <input class="prompt" style="width: 100%;" type="text" placeholder="${holder}">
          <i class="search icon"></i>
        </div>
        <div class="results" style="width: 100%; "></div>
    </div></div>`, `
    $(function () {
      $('#${id}').search({
        debug: true,
        apiSettings: {url: '/api/v2/search/${api}/{query}', cache: false},
        fields: {title: 'name'}
      });
    });
    `];
}
if (domain == "/") {
    document.body.innerHTML = document.body.innerHTML.replaceAll("<!--", "").replaceAll("-->", "");
    let mian = $(".right.floated.five.wide.column")[0];
    let search1 = genSearchBox("查找用户", "user", "ID / 用户名 …", "users");
    mian.children[0].remove();mian.children[0].remove();
    mian.innerHTML = search1[0] + mian.innerHTML;
    let script = document.createElement("script");
    script.innerHTML = search1[1];
    mian.appendChild(script);
}
/******************** problemshow module ********************/
// if (/^\/problem\//.test(domain)) {
//     let data = JSON.parse((await getDOM("/article/154/edit")).getElementById("content").textContent);
//     if (data.hasOwnProperty(domain.match(/\d+/)[0])) {
//         window.location.href = data[domain.match(/\d+/)[0]];
//     };
// }
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
        if (preNum != lastNum) return preNum > lastNum;
    }
    return false;
}
if (domain == "/" && localStorage.getItem("disable_auto_update") != "Y") {
    let today = new Date(Date.now()).toDateString();
    if (localStorage.getItem("last_updated") != today) {
        setTimeout(async () => {
            let latest = (await $.get(`https://api.github.com/repos/${repo}/releases/latest`)).tag_name;
            if (versionCompare(latest.slice(1), GM_info.script.version) && confirm(`检测到新版本 ${latest}，是否更新？`)) {
                window.location.href = `https://github.com/${repo}/releases/download/${latest}/nflsoj-helper.min.user.js`;
            }
        }, 0);
        localStorage.setItem("last_updated", today);
    }
}
/******************** style module ********************/
(/contests|practices|statistics|submissions|\d+\/ranklist|repeat|discussion/.test(domain) ? $(".ui.very.basic.center.aligned.table")[0] :
/cp/.test(domain) ? $(".fixed-table-body")[0] : document.createElement("text")).style.cssText += "background-color:#fff;padding:14px;border:thin solid rgba(200,200,200,.5)";
if (String(localStorage.getItem("bgurl")) != "null") {
    document.body.style.backgroundImage=`url(${localStorage.getItem("bgurl")})`;
}
document.body.style.cssText += "background-size:cover;background-attachment:fixed;";
if (!localStorage.getItem("fgopacity")) localStorage.setItem("fgopacity", "1.0");
document.body.style.opacity = localStorage.getItem("fgopacity");
Array.from($(".ui.comments")).forEach((value) => {
    value.style.cssText += "background-color:#fff;padding:1em;border-radius:0.285714rem;box-shadow:0 1px 2px 0 rgb(34 36 38 / 15%);border:1px solid rgba(34,36,38,.15);";
});
if (/dp/.test(domain)){
    document.getElementsByTagName("table")[0].style.cssText += "background-color:#fff;padding:14px;border:thin solid rgba(200,200,200,.8)";
}
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
async function getEmail(user, size) {
    let mainpage = (await getDOM(user)).getElementsByClassName("attached segment");
    for (let i = 0; i < mainpage.length; ++i)
        if (mainpage[i].parentNode.innerText.includes("Email"))
            return `https://cravatar.cn/avatar/${md5(mainpage[i].innerText)}?s=${size}&d=mp`;
    return "/self/gravatar.png";
}
if (/^\/user\/\d+(\/[^e]|$)/.test(domain)) {
    let config = await getUserConfig(domain);
    let mainpage = $(".attached.segment");
    let nameColor = genColorHTML("nobr", "", mainpage[0].innerHTML, config.nameColor), customIcon = `<i class="${config.userIcon}"></i>`;
    mainpage[0].innerHTML = nameColor;
    $(".header")[1].innerHTML = nameColor + " " + customIcon;
    try {
        for (let i = 0; i < mainpage.length; ++i)
            if (mainpage[i].parentNode.innerText.includes("Email"))
                document.getElementsByTagName("img")[0].src = `https://cravatar.cn/avatar/${md5(mainpage[i].innerText)}?s=324.183&d=mp`;
    } catch {
        console.error("style.email: require network connection");
    }
} else if (/article\/\d+(?=\/(?!e)|$)/.test(domain) && $("img")[0].src.includes("/self/gravatar.png")) {
    try {
        $("img")[0].src = await getEmail($("img")[0].parentNode.children[1].children[0].href, 34);
        Array.from($(".comment")).forEach(async td => {td.getElementsByTagName("img")[0].src = await getEmail(td.getElementsByTagName("a")[1].href, 120)});
    } catch {
        console.error("style.email: require network connection");
    }
} else if (domain == "/") {
    setTimeout(async () => {
        let rank = $(".aligned.table")[0].tBodies[0].children;
        for (let i = 0; i < rank.length; ++i) window.eval(rank[i].childNodes[9].children[0].innerHTML); // eslint-disable-line no-eval
        $(".aligned.table")[0].tHead.children[0].children[1].style.width = "140px";
        $(".aligned.table")[0].tHead.children[0].innerHTML += "<th>个性签名</th>";
        let res = await Promise.all(Array.from({length: rank.length}, (v, i) => rank[i]).map(async td => {
                const href = td.children[1].children[0].getAttribute("href"), name = td.children[1].innerText;
                td.children[1].innerHTML = genColorHTML("a", `href=${href}`, name, ["black", "black"]);
                let config = await getUserConfig(href);
                return genColorHTML("a", `href=${href}`, name, config.nameColor);
            }));
        for (let i = 0; i < rank.length; ++i) rank[i].children[1].innerHTML = res[i];
    }, 0);
}
/******************** BZOJ module ********************/
if (/problem/.test(domain)) {
    let value = $(".ui.grid")[1];
    if (value.children[1].children[0].children[1].innerText == "题目描述") {
        let bzoj = (await getDOM(value.children[1].getElementsByTagName("a")[0].href)).getElementsByClassName("ui grid")[1];
        bzoj.innerHTML = bzoj.innerHTML.replaceAll("upload/", "/bzoj/JudgeOnline/upload/").replaceAll("images/", "/bzoj/JudgeOnline/images/");
        bzoj = bzoj.children;
        let p = value.children[1].outerHTML;
        for (let i = 1; i < bzoj.length; ++i)
            if (!/^\s*$/.test(bzoj[i].children[0].children[1].innerText) || /img/.test(bzoj[i].innerHTML))
                p += bzoj[i].outerHTML;
        value.innerHTML = value.innerHTML.slice(0, value.innerHTML.indexOf(`</div>\n  \n  <div class="row">`) + 12) + p + value.innerHTML.slice(
            value.innerHTML.indexOf("数据范围与提示") == -1 ? value.innerHTML.indexOf(`return submit_code()`) - 176 : value.innerHTML.indexOf("数据范围与提示") - 98
        );
        try {
            let script = document.createElement("script");
            script.innerText = document.getElementsByTagName("script")[15].innerText;
            document.body.appendChild(script);
        } catch {
            console.log("No need to load code editor.");
        }
    }
}
/******************** copy module ********************/
function addCopy(button, code) {
    button.addEventListener("click", () => {
        GM_setClipboard(code.textContent.replaceAll("\n", "\r\n"), "Copy");
        button.textContent = "Copied!";
        setTimeout(() => {button.textContent = "Copy";}, 1000);
    })
}
let clickCountForCode = 0;
function formatCode() {
    clickCountForCode ^= 1;
    let value = $(".existing.segment")[0];
    value.children[1].firstChild.innerHTML = clickCountForCode ? formattedCode : unformattedCode;
    value.children[0].children[1].textContent = clickCountForCode ? "显示原始代码" : "格式化代码";
}
function articleAddCopy(button, code) {
    button.addEventListener("click", () => {
        GM_setClipboard(code.textContent, "text");
        button.lastChild.textContent = "复制成功!";
        setTimeout(() => {button.lastChild.textContent = "复制";}, 1000);
    })
}
if (/article\/\d+(?=\/(?!e)|$)/.test(domain)) {
    let href = domain.match(/\/article\/\d+/)[0];
    let article = await getDOM(href + "/edit");
    let ownDiscuss = $(".floated.labeled.icon.button")[1],
        articleCopy = ownDiscuss ? ownDiscuss.parentNode : $(".padding")[0].children[2];
    articleCopy.innerHTML += `<a style="margin-top:-4px;${ownDiscuss ? "margin-right:3px;" : ""}" class="ui mini orange right floated labeled icon button">
                                <i class="ui copy icon"></i>复制</a>`;
    articleAddCopy(articleCopy.lastChild, article.getElementById("content"));
}
if (!(/login/.test(domain))) {
    if (/\/submission\/\d+/.test(domain) && document.body.innerText.includes("格式化代码")) {
        let value = $(".existing.segment")[0];
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
            for (let i = 0, e; i < (e = $(".existing.segment")).length; i++) {
                if (e[i].children[0].localName != "pre") continue;
                if (/\/problem\//.test(domain) && e[i].parentNode.style.overflow != "hidden") e[i].parentNode.style.width = "50%";
                e[i].innerHTML += `<div class="ui button" style="position:absolute;top:0px;right:-4px;border-top-left-radius:0;border-bottom-right-radius:0;">
                                 Copy</div>`;
                addCopy(e[i].lastChild, e[i].children[0]);
        }
    }
}
/******************** rating module ********************/
function getEloWinProbability(ra, rb) {
    return 1.0 / (1 + Math.pow(10, (rb - ra) / 400.0));
}
function getContestantSeed(contestantIndex, allContestants) {
    let seed = 1;
    let rating = allContestants[contestantIndex].currentRating;
    for (let i = 0; i < allContestants.length; i++) if (contestantIndex != i) seed += getEloWinProbability(allContestants[i].currentRating, rating);
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
    return allContestants.map((contestant, i) => {
        let n = Math.round(deltas[i]);
        return `<td>${Math.round(contestant.currentRating + n)}<span class="rating_${n >= 0 ? "up" : "down"}">(${(n < 0 ? "" : "+") + n})</span></td>`;
    });
}
async function Rating() {
    if (document.getElementsByTagName("thead")[0].rows[0].innerHTML.includes("<th>Rating(Δ)</th>")) return ;
    const hisRating = $(".center.aligned.header")[0].innerText.replaceAll("(", "\\(").replaceAll(")", "\\)") + `<\\/td>[\\s\\S]*?(<td>\\d{4}[\\s\\S]*?<\\/td>)`,
          curRating = /<i class="star icon"><\/i>积分 (\d+)/;
    let arr = document.getElementsByTagName("tbody")[0].rows, c = Array.from({length: arr.length}, (v, i) => i);
    c = (await $.get(arr[0].innerHTML.match(/\/user\/\d+/)[0])).match(hisRating) != null
        ? await Promise.all(c.map(async i => (await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0])).match(hisRating)[1]))
        : calcRating(await Promise.all(c.map(async i => ({
            rank: arr[i].children[0].innerText,
            currentRating: parseInt((await $.get(arr[i].innerHTML.match(/\/user\/\d+/)[0])).match(curRating)[1])
        }))));
    document.getElementsByTagName("thead")[0].rows[0].innerHTML += "<th>Rating(Δ)</th>";
    for (let i = 0; i < arr.length; ++i) arr[i].innerHTML += c[i];
}
/******************** rank module ********************/
if (/\d+\/(ranklist|repeat)/.test(domain)) {
    let head = document.getElementsByTagName("tr")[0], pos = /ranklist/.test(domain) ? head.innerHTML.indexOf("</th>") + 5 : 0;
    if (head.innerHTML.indexOf("用户名") == -1) {
        let arr = document.getElementsByTagName("tbody")[0].rows;
        let name = await Promise.all(Array.from({length: arr.length}, (v, i) => i).map(async (i) => {
            let raw = await $.get(arr[i].innerHTML.match(/\/submission\/\d+/)[0]);
            return `<td><a href="/user/${raw.match(/"userId":(\d+)/)[1]}">${raw.match(/"user":"([\s\S]+?)"/)[1]}</a></td>`;
        }));
        head.innerHTML = head.innerHTML.slice(0, pos) + "<th>用户名</th>" + head.innerHTML.slice(pos);
        for (let i = 0; i < arr.length; ++i) {
            let pos = /ranklist/.test(domain) ? arr[i].innerHTML.indexOf("</td>") : 0;
            arr[i].innerHTML = arr[i].innerHTML.slice(0, pos) + name[i] + arr[i].innerHTML.slice(pos);
        }
    }
    if (/ranklist/.test(domain)) {
        $(".padding")[0].innerHTML =
              `<span class="ui mini right floated labeled blue icon button" id="rating" style="top:6px;"><i class="calculator icon" id=calc></i>Predict Rating</span>`
            + $(".padding")[0].innerHTML;
        rating.addEventListener("click", async () => {
            rating.childNodes[1].data = "Please Wait...";
            await Rating();
            rating.childNodes[1].data = "Done!";
        });
    }
}
/******************** dashboard ********************/
if (domain == "/") {
    let col = $(".eleven.wide.column")[0], ind = col.innerHTML.search(/<h4 class="ui top attached block header"><i class="ui signal/);
    col.innerHTML = col.innerHTML.slice(0, ind) + `
    <h4 class="ui top attached block header">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAATfSURBVHhe7ZvtbuI4FIYdvikFMdXMbn9MpUpzG72F3YvduYT2NuZHq/7YUTsdSvkMgaxfx6ecmBAWx4mA9JGsGCexfd5z/EWLF0qEwd3dnc6dFjc3Nzq3ZkOAUzWew4V4F2Cb4UmqHRO77NoqwLEbbpIkBGysIHPqxgPYlGRXpQzGbwO2qwggymC8aWNMgLLARXgXoEyhzyllBHA+BNDX0vIhgL6Wlg8B9HUvPM8Tq9VKf4o+c+r1uiqr1Wri/PxcVCrrZvizQRDoXESn0xGtVmujPoCyZrOpruZ7gN/fB+sI4Eah0xx0EGcsXEejUUysdrutc0IJRKDjw+FQTCYT9W61WtV3IkFRNp/P1RWimtB9sy+7sBLg4uIipvRsNtO5iKQOEtPpVOfiNBoNZTTVu1wu1RWYHufimJh92YWVAC8vLxte4vDOm8CbScB7MJ5HCEGCknGIEldYDwFAoY2xx8HwgDHwqjmm08SBqIA/D8hgCu9tItqQSQB0GJ2F9zg0jn3fV14jwwBEIZImM3r++vpal6yFJhaLhc5lx0oA7gFuHJFURvAI4JOgGUX39/c6t5u0OWEXVgJwA03vg16vp3ObwHs0LCgBmgOQIAyfLNEe3YNQpsAQle6niZ+ElQA8BJM69Pr6qnOb4FkKc0oEfcbQMJczupckOKD7+5JpDjgFCheg2+2qUE1bDYrESgCadGAEkjmBpfH8/KzmiCwTl0usBMAkhXkAnsSaj+Xu/wKxsOU9FKwEgMFYCmnDY+7e+v2+Kke4j8djXRqBiEG5CZ4HEOjy8lLlOdQOPcdBNMEhZ2dniffTsJ4D0BAlvmTh82AwUDMyruaSiM6+vb3pT2tITAj2+Pio8gTeQX1oB1dzyGGjhA0WbcD4u7uwEgANoCFKOMYS6Bw8DG9hqPBTI5F0YoMRqAvRhfe4kWgPCeWo1xxy8DzeJXh+F9YRwBlP1mEe1j3l4dF0LIJwKWZ+/PQXLldinnRikz0ZzaaiLY2ZTGbCn6/3GqtKJDj2B4iCwDBw3xMgx0qADYXXO1rhL6LOVGXVSLVa/ODiLYPkRmUdlVZbwOya1xDdVj8ql3jt9fkBNHrGJsk4K+yDlQBXV1c6p2Htj2dyDDZkyHZqwqt5YsXW+6+fvryHdqOB7XBVIJin0myvVRcd+XzTq4s/un3xOv2lngOYS7yerK8p6/3UEE+/nvWdiC+f/9S5/bES4OHhQeciwmAdEWcyhb6cG8aBKpcLZXRD8vj7ScwRyjL5PrbDSwHftoVcUYYL9XwYLsQgiC+TXSlKOJT1zeX93764qMe/cPn59K/O7Y+VAHnQ7bJxVCDOBMDIz/I9zcDf/G6gCJwJgGkJ4W/Lw2z7CTJPvNvbWzWAs/51+Ns/f+lcdn78/V3n8oP+McRJBLg0HriuL43MAuTV2aJEyDwEeEddhK7r+rbhdAgcMwcvADxlJpccZQS4FOFoh4ArEQ5eAEzOPLmm9JOg02XQNUnLIA/9LBFB9WSOgLzW6iK2w8DJEHDd2aKMB84OQ0VxcENgF2iIp0Mj9wjI0+ijiIC8hHVVbyH7ANciuKzvfQiAvLx1iBQ2BA4RPi/FBDjEWTpvKmUKe2A6eWMI4IFTjQTTLjg/9aezpxIdabbFfjx9qp434Y7d+PU4OGUh4lEtxH8AfYGTaReJbgAAAABJRU5ErkJggg==" style="width:20px;height:20px;position:relative;top:-3px;">NFLSOJ Helper 控制面板
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
    l1.addEventListener("click", () => {
        localStorage.setItem("disable_auto_update", l1.checked ? "N" : "Y");
        if (l1.checked) localStorage.removeItem("last_updated");
    });
    l2.addEventListener("click", async () => {
        window.location.href = `https://github.com/${repo}/releases/download/${(await $.get(`https://api.github.com/repos/${repo}/releases/latest`)).tag_name}/nflsoj-helper.min.user.js`;
    });
    f1.addEventListener("click", () => {
        document.cookie = `${document.cookie.match(/(^| )(login=[^;]*)(;|$)/)[2]};expires=Wed, 04 Aug 2077 01:00:00 GMT`;
        alert("Success");
    });
    f2.addEventListener("click", () => {
        let ans = prompt("请输入背景链接，想删除背景选择“取消”，默认图片由GlaceonVGC提供", `https://raw.githubusercontent.com/${repo}/master/images/471.jpg`);
        localStorage.setItem("bgurl", ans);
        localStorage.setItem("fgopacity", ans ? 0.8 : 1.0);
        window.location.reload();
    });
}
