// ==UserScript==
// @name         NFLSOJ Helper
// @namespace    https://github.com/NFLSCode/nflsoj-helper
// @version      dev
// @description  Use NFLSOJ More Easily
// @author       lexiyvv & ppip & GlaceonVGC & ACrazySteve
// @match        *://www.nfls.com.cn:20035/*
// @match        *://192.168.188.77/*
// @match        *://192.168.188.88/*
// @require      http://www.nfls.com.cn:20035/cdnjs/jquery/3.3.1/jquery.min.js
// @require      http://www.nfls.com.cn:20035/cdnjs/blueimp-md5/2.10.0/js/md5.min.js
// @require      http://www.nfls.com.cn:20035/cdnjs/semantic-ui/2.4.1/semantic.min.js
// @grant        GM_setClipboard
// @grant        GM_info
// @icon         https://cdn.jsdelivr.net/gh/NFLSCode/nflsoj-helper@master/images/icon.png
// @icon64       https://cdn.jsdelivr.net/gh/NFLSCode/nflsoj-helper@master/images/icon.png
// ==/UserScript==
/* global $, md5 */
/* eslint-disable curly */

const domain = window.location.pathname, repo = "Eletary/nflsoj-helper", USERNAME = /\/user\/\d+/,
      fool = (localStorage.getItem("meow_meow_meow") == 'Y'), bigfool = 'https://s2.loli.net/2023/03/14/HrTUvndYtm3aceL.gif', foolimg = `<img src="${bigfool}" style="width:24px;height:29px;" />`;
/******************** login module ********************/
function loginCookie(cookie) {
    console.log(cookie);
    document.cookie = 'login=' + cookie + ';expires=Wed, 04 Aug 2077 01:00:00 GMT';
    document.cookie = 'connect.sid=;';
}
/*
if (domain == "/help" && window.location.href.includes('10611')) {
    $("body")[0].style='';
    $("body").html(`
    <iframe id="ifi"
      title="Inline Frame Example"
      width=100%
      height=100%
      src="http://www.nfls.com.cn:20035/help">
    </iframe>
  `);
}
*/
if (domain == "/login") {
    $(document).ready(() => {
        let script = document.createElement('script');
        script.innerHTML = "login = () => {}";
        document.body.appendChild(script);
        let hack = () => {
            console.log('ewe');
            let show_error = (error) => {$("#error").text(error);$("#error").show();}
            let username = $("#username").val(), password = md5($("#password").val() + "syzoj2_xxx");
            $("#login").addClass("loading");
            $.ajax({
                url: "/api/login",
                type: 'POST',
                data: {
                    "username": $("#username").val(),
                    "password": password
                },
                async: true,
                success: function(data) {
                    let error_code = data.error_code;
                    switch (error_code) {
                        case 1001:
                            show_error("用户不存在");
                            break;
                        case 1002:
                            show_error("密码错误");
                            break;
                        case 1003:
                            show_error("您尚未设置密码，请通过下方「忘记密码」来设置您的密码。");
                            break;
                        case 2022:
                            show_error("用户已过期");
                            break;
                        case 2020:
                        case 1:
                            loginCookie(escape(`["${username}","${password}"]`));
                            window.location.href = "/";
                            return;
                        default:
                            show_error("未知错误");
                            break;
                    }
                    $("#login").text("登录");
                    $("#login").removeClass("loading");
                },
                error:  function(XMLHttpRequest) {
                    alert(XMLHttpRequest.responseText);
                    show_error("未知错误");
                    $("#login").text("登录");
                }
            });
        };
        let key_hack = (event) => {if (event.keyCode == 13) hack();};
        $("#username").keydown(key_hack);
        $("#password").keydown(key_hack);
        $("#login").click(hack);
    });
}
/******************** prompt module ********************/
let count = 0;
function promptYesOrNo(title, content, f) {
    let id = 'yesorno' + ++count, agree = 'Argee' + count;
    $('body').prepend(`
    <div class="ui modal" id="${id}">
      <div class="header">
        ${title}
      </div>
      <div class="content">
        <p>${content}</p>
      </div>
      <div class="actions">
        <div class="actions">
          <div class="ui red deny button">
            No
          </div>
          <div class="ui positive button", id="${agree}">
            Yes
          </div>
        </div>
      </div>
    </div>`);
    $('#' + id).modal('show');
    $('#' + agree).click(f);
}
function promptContent(title, content) {
    let id = 'content' + ++count;
    $("body").prepend(`
    <div class="ui modal" id="${id}">
      <div class="header">
        ${title}
      </div>
      <div class="content">
        <p>${content}</p>
      </div>
      <div class="actions">
        <div class="actions">
          <div class="ui positive button">
            确定
          </div>
        </div>
      </div>
    </div>`);
    return '#' + id;
}
let Inform;
if (domain == "/") {
    Inform = promptContent("NFLSOJ Helper 帮助信息", `
    <p>版本：v${GM_info.script.version}</p><p>作者：${GM_info.script.author}</p>
    ${foolimg}
    <span class="ui toggle checkbox" style="position:relative;left:10px;">
      <input id="meow" type="checkbox" ${localStorage.getItem("meow_meow_meow") != "Y" ? "" : "checked"}>
      <label>  </label>
    </span>`); // eslint-disable-line no-undef
}
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
async function updateScript(latest) {
    localStorage.setItem("show_changelog", await $.post("/api/v2/markdown","s=" + encodeURIComponent(`## ${latest.tag_name}\n${latest.body}`)));
    window.location.href = `https://github.com/${repo}/releases/download/${latest.tag_name}/nflsoj-helper.min.user.js`;
}
if (domain == "/" && localStorage.getItem("disable_auto_update") != "Y") {
    let today = new Date(Date.now()).toDateString();
    if (localStorage.getItem("last_updated") != today) {
        localStorage.setItem("last_updated", today);
        setTimeout(async () => {
            let latest = await $.get(`https://api.github.com/repos/${repo}/releases/latest`);
            if (versionCompare(latest.tag_name.slice(1), GM_info.script.version)) { // eslint-disable-line no-undef
                promptYesOrNo("更新提醒", `检测到新版本 ${latest.tag_name}，是否更新？`, () => {updateScript(latest)});
            }
        }, 0);
    }
}
/******************** contest module ********************/
try {
    let username = $(".dropdown.item")[0].children[0].innerText.slice(0, -1);
    $(".menu:first").find("a")[3].outerHTML=`<div class="item" style="padding: 0px;">
                <div class="ui simple dropdown item">
                  <a href="/contests" style="color: inherit; --darkreader-inline-color: inherit;" data-darkreader-inline-color=""><i class="calendar icon"></i> 比赛 <i class="dropdown icon" style="margin: 0px;"></i></a>
                  <div class="menu">
                    <a class="item" href="/cp${$(".menu:first").find("a")[9].href.match(USERNAME)[0]}"><i class="list icon"></i>我的比赛</a>
                  <a class="item" href="/summary/?username=${username}"><i class="tasks icon"></i>总结</a></div>
                </div>
              </div>`
    if (/contest\/\d+(?!\d|\/[a-z])/.test(domain)) document.body.innerHTML = document.body.innerHTML.replaceAll("<!--", "").replaceAll("-->", "");
} catch {
    console.info('iframe');
}
async function getDOM(href) {
    return new DOMParser().parseFromString(await $.get(href), "text/html");
}
/******************** rightcol module ********************/
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
async function hitokoto() {
    let h = await $.get("https://v1.hitokoto.cn/?c=a");
    return `<a style='color:black' href=https://hitokoto.cn/?uuid=${h.uuid} target='_blank'>${h.hitokoto}</a><div style="margin-top: 14px;text-align: right;font-size: .95em;color: #999;">${"\u2014\u2014"}${h.from}</div>`;
}
if (domain == "/") {
    document.body.innerHTML = document.body.innerHTML.replaceAll("<!--", "").replaceAll("-->", "");
    let mian = $(".right.floated.five.wide.column")[0];
    let search1 = genSearchBox("查找用户", "user", "ID / 用户名 …", "users");
    mian.children[0].remove();mian.children[0].remove();
    mian.innerHTML = search1[0] + mian.innerHTML;
    let script = document.createElement("script");
    script.innerHTML = search1[1];
    try {
        mian.innerHTML = `
        <h4 class="ui block top attached header"><i aria-hidden="true" class="comment alternate icon"></i><div class="content">Hitokoto (ヒトコト)
          <i id="hit" title="Refresh" style="" class="redo icon button"></i></div></h4>
        <div class="ui bottom attached center aligned segment">
          <div id="hitword"></div>
          <div id="hithold" class="ui placeholder">
            <div class="paragraph">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
          </div>
        </div>
        <style>
          #hit {
            opacity: .2;position: absolute;right: 10px;height: 19px;display: inline-flex;align-items: center;
          }
          #hit:hover {
            opacity: .4;
          }
        </style>` + mian.innerHTML;
        let getyy = async () => {
            $("#hitword").hide();
            $("#hithold").show();
            $("#hitword").html(await hitokoto());
            $("#hitword").show();
            $("#hithold").hide()
        };
        getyy();
        $("#hit").click(getyy);
    } catch {
        console.error("rightcol.hitokoto: require network connection");
    }
    mian.appendChild(script);
}
/******************** style module ********************/
(/contests|practices|statistics|submissions|\d+\/ranklist|repeat|discussion/.test(domain) ? $(".ui.very.basic.center.aligned.table")[0]
: document.createElement("text")).style.cssText += "background-color:#fff;padding:14px;border:thin solid rgba(200,200,200,.5)";
if (String(localStorage.getItem("bgurl")) != "null" && document.getElementsByTagName("span")[0].id != 'submission_content') {
    document.body.style.backgroundImage = `url(${localStorage.getItem("bgurl")})`;
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
async function getEmail(user, size) {
    if (fool) return bigfool;
    let mainpage = (await getDOM(user)).getElementsByClassName("attached segment");
    for (let i = 0; i < mainpage.length; ++i)
        if (mainpage[i].parentNode.innerText.includes("Email"))
            return `https://cravatar.cn/avatar/${md5(mainpage[i].innerText)}?s=${size}&d=mp`;
    return "/self/gravatar.png";
}
if (/^\/user\/\d+(\/[^e]|$)/.test(domain)) {
    let mainpage = $(".attached.segment");
    try {
        if (fool) document.getElementsByTagName("img")[0].src = bigfool;
        else
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
    }, 0);
}
/******************** BZOJ module ********************/
if (/problem(?!s)/.test(domain)) {
    $($("script")[16]).remove();
    let value = $(".ui.grid")[1];
    if (value.children[1].children[0].children[1].innerText.includes("题目描述")) {
        let bzoj = (await getDOM(value.children[1].getElementsByTagName("a")[0].href)).getElementsByClassName("ui grid")[1];
        bzoj.innerHTML = bzoj.innerHTML.replaceAll("upload/", "/bzoj/JudgeOnline/upload/").replaceAll("images/", "/bzoj/JudgeOnline/images/");
        bzoj = bzoj.children;
        let p = "";
        for (let q of [0,1])
            p += value.children[q].outerHTML;
        for (let i = 1; i < bzoj.length; ++i)
            if (!/^\s*$/.test(bzoj[i].children[0].children[1].innerText) || /img/.test(bzoj[i].innerHTML))
                p += bzoj[i].outerHTML;
        for (let q of value.children)
            if (q.innerHTML.includes('数据范围') || q.innerHTML.includes('C++'))
                p += q.outerHTML;
        $(value).html(p);
        let script = document.createElement("script");
        script.innerHTML = `eval($("script[type='text/javascript']:last").text())`;
        document.body.appendChild(script);
    }
}
/******************** copy module ********************/
$('.ban_copy').removeClass('ban_copy');
function addCopy(button, code) {
    button.addEventListener("click", () => {
        GM_setClipboard(code.textContent.replaceAll("\n", "\r\n"), "Copy"); // eslint-disable-line no-undef
        if (fool) $(button).transition('tada');
        else {
            button.textContent = "Copied!";
            setTimeout(() => {button.textContent = "Copy";}, 1000);
        }
    })
}
let clickCountForCode = 0;
function formatCode() {
    clickCountForCode ^= 1;
    let value = $(".existing.segment")[0];
    value.children[1].firstChild.innerHTML = clickCountForCode ? formattedCode : unformattedCode; // eslint-disable-line no-undef
    value.children[0].children[1].textContent = clickCountForCode ? "显示原始代码" : "格式化代码";
}
if (!(/login/.test(domain))) {
    let qaq = 'Copy';
    if (fool) {
        qaq = foolimg;
    }
    if (/\/submission\/\d+/.test(domain) && document.body.innerText.includes("格式化代码")) {
        let value = $(".existing.segment")[0];
        value.firstChild.style.borderRadius = "0 .28571429rem 0 0";
        value.firstChild.style.position = "unset";
        let position = value.innerHTML.search(/<\/a>/) + 4;
        value.innerHTML = `<span style="position:absolute;top:0px;right:-4px;">
                             <div class="ui button" style="position:relative;left:4px;border-right:1px solid rgba(0,0,0,0.6);border-radius:0 0 0 .28571429rem;">
                               ${qaq}
                             </div>${value.innerHTML.slice(0, position)}
                           </span>${value.innerHTML.slice(position)}`;
        addCopy(value.firstChild.children[0], value.lastChild);
        value.children[0].children[1].addEventListener("click", formatCode);
    } else {
        for (let i = 0, e; i < (e = $(".existing.segment")).length; i++) {
            if (e[i].children[0].localName != "pre") continue;
            if (/\/problem\//.test(domain) && e[i].parentNode.style.overflow != "hidden") e[i].parentNode.style.width = "50%";
            e[i].innerHTML += `<div class="ui button" style="position:absolute;top:0px;right:-4px;border-top-left-radius:0;border-bottom-right-radius:0;">
                                 ${qaq}</div>`;
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
    const hisRating = $(".center.aligned.header")[0].innerText.replaceAll("(", "\\(").replaceAll(")", "\\)") + `<\\/td>[\\s\\S]*?(<td>\\d{3,4}[^/]*?<\\/td>)`,
          curRating = /<i class="star icon"><\/i>积分 (\d+)/;
    let arr = document.getElementsByTagName("tbody")[0].rows, c = Array.from({length: arr.length}, (v, i) => i);
    c = (await $.get(arr[0].innerHTML.match(USERNAME)[0])).match(hisRating) != null
        ? await Promise.all(c.map(async i => (await $.get(arr[i].innerHTML.match(USERNAME)[0])).match(hisRating)[1]))
        : calcRating(await Promise.all(c.map(async i => ({
            rank: arr[i].children[0].innerText,
            currentRating: parseInt((await $.get(arr[i].innerHTML.match(USERNAME)[0])).match(curRating)[1])
        }))));
    document.getElementsByTagName("thead")[0].rows[0].innerHTML += "<th>Rating(Δ)</th>";
    for (let i = 0; i < arr.length; ++i) arr[i].innerHTML += c[i];
}
/******************** rank module ********************/
if (/\d+\/(ranklist|repeat)/.test(domain)) {
    let head = document.getElementsByTagName("tr")[0], pos = /ranklist/.test(domain) ? head.innerHTML.indexOf("</th>") + 5 : 0;
    let arr = document.getElementsByTagName("tbody")[0].rows;
    if (head.innerHTML.indexOf("用户名") == -1) {
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
        $('#rating').click(async () => {
            $('#rating').html("<i class='calculator icon' id=calc></i>Please Wait...");
            await Rating();
            $('#rating').html("<i class='calculator icon' id=calc></i>Done!");
        });
    }
}
/******************** settings module ********************/
if (/user\/\d+\/edit/.test(domain)) {
    let intro;
    for (let q of $(await $.get($('.dropdown.item')[1].children[0].href)).find('.row'))
        if ($(q).html().includes('个性签名'))
            intro = q.children[0].children[1];
    if (intro.children[0] != null) intro = intro.children[0];
    $('.field')[5].after($(`<div class="field">
      <label for="information">个性签名（技术原因无法获取签名源码）</label>
      <textarea class="markdown-edit" rows="5" id="information" name="information">${intro.innerHTML}</textarea>
    </div>`)[0]);
}
/******************** submission module ********************/
if (/\/practice\/\d+\/problem\/\d+/.test(domain)) {
    $('#submit_code').submit(() => setTimeout(() => {
        console.log('submitted');
        let script = document.createElement("script");
        script.innerHTML = '__showList()';
        document.body.appendChild(script);
        setTimeout(() => {if (!$('#ListType')[0].checked) $('#ListType').click();},100);
    },500));
}
/******************** dashboard ********************/
if (domain == "/") {
    let col = $(".eleven.wide.column")[0], ind = col.innerHTML.search(/<h4 class="ui top attached block header"><i class="ui signal/);
    col.innerHTML = col.innerHTML.slice(0, ind) + `
    <h4 class="ui top attached block header">
      <img src="https://cdn.jsdelivr.net/gh/${repo}@master/images/icon.png" style="width:20px;height:20px;position:relative;top:-3px;">NFLSOJ Helper 控制面板
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
          <h4 style="display:inline;">相关链接</h4>
          <a class="ui blue button" style="position:relative;left:20px;" href="https://github.com/${repo}/">
            <i class="ui linkify icon"></i>转到 NFLSOJ Helper 官方主页
          </a><a class="ui green button" id="l2" style="position:relative;left:20px;">
            <i class="repeat icon"></i>获取最新版
          </a><a class="ui orange button" id="l3" style="position:relative;left:20px;">
            <i class="info icon"></i>帮助
          </a>
        </td></tr>
        <tr><td>
          <h4 style="display:inline;">主要功能</h4>
          <a class="ui button" id="f1" style="position:relative;left:20px;">
            <i class="code icon"></i>更换背景
          </a><a class="ui button" id="f2" style="position:relative;left:20px;">
            <i class="code icon"></i>Login with cookie
          </a>
        </td></tr>
      </table>
    </div>` + col.innerHTML.slice(ind);
    $('#l1').click(() => {
        localStorage.setItem("disable_auto_update", $('#l1').prop('checked') ? "N" : "Y");
        if ($('#l1').prop('checked')) localStorage.removeItem("last_updated");
    });
    $('#l2').click(async () => {
        updateScript(await $.get(`https://api.github.com/repos/${repo}/releases/latest`));
    });
    $('#l3').click("click", () => {$(Inform).modal('show');});
    $('#f1').click(() => {
        let ans = prompt("请输入背景链接，想删除背景选择“取消”，默认图片由GlaceonVGC提供", `https://cdn.jsdelivr.net/gh/${repo}@master/images/471.jpg`);
        localStorage.setItem("bgurl", ans);
        localStorage.setItem("fgopacity", ans ? 0.8 : 1.0);
        window.location.reload();
    });
    $('#f2').click(async () => {
        loginCookie(prompt("Cookie:", ""));
        window.location.reload();
    });
    $('#meow').click(() => {
        localStorage.setItem("meow_meow_meow", $('#meow').prop('checked') ? "Y" : "N");
        window.location.reload();
    })
}
if (fool) {
    try {
        $('a.header')[0].innerHTML = `<img src=${bigfool} />`;
    } catch {
        console.log('/yiw');
    }
    if (/submission/.test(domain))
        for (let meow of $('i')) {

            if (/checkmark|bomb|ban|clock|microchip|print|file outline|hourglass half|code|server|folder open outline|minus|question circle|spinner/.test(meow.className))
                meow.outerHTML = foolimg;
            if (/retweet/.test(meow.className)) meow.outerHTML = `<img style="width:240px;height:290px;" src = ${bigfool} />`;
            if (/remove/.test(meow.className)) meow.outerHTML = `<img style="width:24px;height:29px;transform:rotate(180deg)" src='${bigfool}' />`
        }
}
if (localStorage.getItem("show_changelog") != null) {
    $(promptContent("更新日志", localStorage.getItem("show_changelog"))).modal('show');
    localStorage.removeItem("show_changelog");
}