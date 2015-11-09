// ==UserScript==
// @name           futaba ID+IP popup
// @namespace      https://github.com/himuro-majika
// @description    同じIDやIPのレスをポップアップしちゃう
// @note           赤福の「続きを読む」機能で読み込んだレスには反応しません。
// @note           適宜ページ全体をリロードしてください。
// @include        http://may.2chan.net/b/res/*
// @include        http://img.2chan.net/b/res/*
// @include        http://may.2chan.net/id/res/*
// @include        http://dec.2chan.net/53/res/*
// @include        http://dec.2chan.net/52/res/*
// @include        http://zip.2chan.net/1/res/*
// @include        http://zip.2chan.net/12/res/*
// @include        http://may.2chan.net/27/res/*
// @include        http://up.2chan.net/d/res/*
// @include        http://up.2chan.net/t/res/*
// @include        http://dat.2chan.net/21/res/*
// @include        http://up.2chan.net/e/res/*
// @include        http://up.2chan.net/j/res/*
// @include        http://nov.2chan.net/37/res/*
// @include        http://dat.2chan.net/45/res/*
// @include        http://up.2chan.net/r/res/*
// @include        http://jun.2chan.net/b/res/*
// @include        http://may.2chan.net/b/res/*
// @include        http://may.2chan.net/id/res/*
// @include        http://dat.2chan.net/23/res/*
// @include        http://jun.2chan.net/31/res/*
// @include        http://nov.2chan.net/28/res/*
// @include        http://zip.2chan.net/11/res/*
// @include        http://zip.2chan.net/14/res/*
// @include        http://zip.2chan.net/32/res/*
// @include        http://zip.2chan.net/8/res/*
// @include        http://jun.2chan.net/51/res/*
// @include        http://zip.2chan.net/5/res/*
// @include        http://zip.2chan.net/3/res/*
// @include        http://cgi.2chan.net/g/res/*
// @include        http://zip.2chan.net/2/res/*
// @include        http://dat.2chan.net/44/res/*
// @include        http://up.2chan.net/v/res/*
// @include        http://nov.2chan.net/y/res/*
// @include        http://dat.2chan.net/46/res/*
// @include        http://dat.2chan.net/22/res/*
// @include        http://up.2chan.net/x/res/*
// @include        http://nov.2chan.net/35/res/*
// @include        http://dec.2chan.net/50/res/*
// @include        http://dat.2chan.net/38/res/*
// @include        http://cgi.2chan.net/f/res/*
// @include        http://may.2chan.net/39/res/*
// @include        http://cgi.2chan.net/k/res/*
// @include        http://dat.2chan.net/l/res/*
// @include        http://may.2chan.net/40/res/*
// @include        http://zip.2chan.net/6/res/*
// @include        http://img.2chan.net/9/res/*
// @include        http://www.2chan.net/junbi/res/*
// @version     1.1
// @grant       GM_addStyle
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
(function () {

	var Start = new Date().getTime();//count parsing time
	var saba = location.host.replace(".2chan.net","")+location.pathname.replace("futaba.htm","");
	var timer;

	setClassAndName();
	setEvent();
	setStyle();

	function setClassAndName(){
		var atd = document.evaluate(
			"/html/body/form/table/tbody/tr/td[@bgcolor]",
			document,
			null,
			XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
			null);
		for (var i = 0; i < atd.snapshotLength; i++) {
			var td = atd.snapshotItem(i);
			var id = [];
			id[i] = td.textContent.match(/I[DP]:\S+/);
			td.innerHTML = td.innerHTML.replace(/I[DP]:\S+/, "<a class='futaba_ip_popup_name' name='" + id[i] + "'>" + id[i]);
			td.innerHTML = td.innerHTML.replace(" No.", "</a> No.");
		}
	}

	function setEvent(){
		var aa = document.evaluate(
			"//a[@class='futaba_ip_popup_name']",
			document,
			null,
			XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
			null);
		for (var i = 0; i < aa.snapshotLength; i++) {
			var a = aa.snapshotItem(i);
			a.addEventListener("mouseover",show,true);
			a.addEventListener("mouseout",hide,true);
		}
	}

	function show(event) {
		delpop();
		var wX;	//ポップアップ表示位置X
		var wY;	//ポップアップ表示位置Y
		var tda = document.getElementsByName(this.name);
		var restable = [];
		for (var i = 0; i < tda.length; i++) {
			restable.push(tda[i].parentNode.parentNode.parentNode.innerHTML);
		}
		var table = document.createElement("table");
		table.id = "futaba_ip_popup_pop";
		table.innerHTML = restable.join(" ");
		table.addEventListener("mouseover",function(){
			clearTimeout(timer);
		},true);
		table.addEventListener("mouseout",hide,true);
		var body = document.getElementsByTagName("body");
		body[0].appendChild(table);
		wX = event.clientX;
		wY = window.scrollY + event.clientY - table.clientHeight;
		if ( wY < 0 ) {	//ポップアップが上に見きれる時は下に表示
			wY = window.scrollY + event.clientY;
		}
		table.setAttribute("style", "left:" + wX + "px; top:" + wY + "px;");
	}

	function hide() {
		timer = setTimeout(delpop,250);
	}

	function delpop() {
		var doc_pop = document.getElementById("futaba_ip_popup_pop");
		if ( doc_pop ) {
			doc_pop.parentNode.removeChild(doc_pop);
		}
	}

	/*
	 * スタイル設定
	 */
	function setStyle(){
		var css = "#futaba_ip_popup_pop { position: absolute; z-index: 100; background-color: #eeaa88; }" +
		"#futaba_ip_popup_pop > tbody > tr > td { color: #800000; font-size: 8pt !important; }" +
		"#futaba_ip_popup_pop > tbody > tr > td > blockquote{ margin-top: 0px !important; argin-bottom: 0px !important; }" +
		".futaba_ip_popup_name { color: #F00;}";
		if (typeof GM_addStyle != "undefined") {
			GM_addStyle(css);
		} else if (typeof addStyle != "undefined") {
			addStyle(css);
		} else {
			var heads = document.getElementsByTagName("head");
			if (heads.length > 0) {
				var node = document.createElement("style");
				node.type = "text/css";
				node.appendChild(document.createTextNode(css));
				heads[0].appendChild(node);
			}
		}
	}

	console.log('Parsing '+saba+': '+((new Date()).getTime()-Start) +'msec');//log parsing time

})();
