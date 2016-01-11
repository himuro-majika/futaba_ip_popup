// ==UserScript==
// @name           futaba ID+IP popup
// @namespace      https://github.com/himuro-majika
// @description    同じIDやIPのレスをポップアップしちゃう
// @author         himuro_majika
// @note           赤福の「続きを読む」機能で読み込んだレスには反応しません。
// @note           適宜ページ全体をリロードしてください。
// @include        http://*.2chan.net/*/res/*.htm
// @version        1.1
// @grant          GM_addStyle
// @license        MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
(function () {

	var Start = new Date().getTime();//count parsing time
	var saba = location.host.replace(".2chan.net","") +
		location.pathname.replace("futaba.htm","");
	var timer_show, timer_hide;

	setClassAndName();
	createCounter();
	setEvent();
	setStyle();

	// ID/IPにclass,nameを設定する
	function setClassAndName() {
		res();
		// レス
		function res() {
			var atd = document.getElementsByClassName("rtd");
			for (var i = 0; i < atd.length; i++) {
				var td = atd[i];
				td.innerHTML = td.innerHTML.replace(
					/(I[DP]:\S+)/,
					"<a class='GM_fip_name' name='$1'>$1</a>"
				);
			}
		}
	}
	// 出現数の表示
	function createCounter() {
		var a = document.getElementsByClassName("GM_fip_name");
		var ids = {};
		for (var i = 0; i < a.length; i++) {
			var node = a[i];
			var id = node.name;
			if (ids[id]) {
				ids[id]++;
			} else {
				ids[id] = 1;
			}
			var name = document.querySelectorAll(".GM_fip_name[name='" + id + "']");
			var span = document.createElement("span");
			span.setAttribute("class", "GM_fip_counter");
			span.textContent = "[" + ids[id] + "/" + name.length + "]";
			// node.parentNode.insertBefore(span, node.nextSibling);
			node.appendChild(span);
		}
	}
	// イベントを設定
	function setEvent() {
		var aa = document.getElementsByClassName("GM_fip_name");
		for (var i = 0; i < aa.length; i++) {
			var a = aa[i];
			a.addEventListener("mouseover", show, true);
			a.addEventListener("mouseout", hide, true);
		}
	}
	// ポップアップを表示する
	function show(event) {
		clearTimeout(timer_show);
		delpop();
		var name = this.name;
		timer_show = setTimeout(function() {
			var wX;	//ポップアップ表示位置X
			var wY;	//ポップアップ表示位置Y
			var popup = document.createElement("table");
			var tda = document.getElementsByName(name);
			for (var i = 0; i < tda.length; i++) {
				// restable.push(tda[i].parentNode.parentNode.parentNode.innerHTML);
				var table = tda[i].parentNode.parentNode.parentNode.cloneNode(true);
				popup.appendChild(table);
			}
			var restable = [];
			console.dir(restable);
			popup.id = "GM_fip_pop";
			// popup.innerHTML = restable.join(" ");
			popup.addEventListener("mouseover",function(){
				clearTimeout(timer_hide);
			},true);
			popup.addEventListener("mouseout",hide,true);
			var body = document.getElementsByTagName("body");
			body[0].appendChild(popup);
			wX = event.clientX + 10;
			wY = window.scrollY + event.clientY - popup.clientHeight - 10;
			if ( wY < 0 ) {	//ポップアップが上に見きれる時は下に表示
				wY = window.scrollY + event.clientY;
			}
			popup.setAttribute("style", "left:" + wX + "px; top:" + wY + "px;");
		}, 300);
	}
	// ポップアップを消す
	function hide() {
		clearTimeout(timer_show);
		timer_hide = setTimeout(delpop, 300);
	}

	function delpop() {
		var doc_pop = document.getElementById("GM_fip_pop");
		if ( doc_pop ) {
			doc_pop.parentNode.removeChild(doc_pop);
		}
	}
	/*
	 * スタイル設定
	 */
	function setStyle() {
		var css = "#GM_fip_pop {" +
			"  position: absolute;" +
			"  z-index: 350;" +
			"  background-color: #eeaa88;"+
			"}" +
		"#GM_fip_pop > tbody > tr > td {" +
			"  color: #800000;" +
			"  font-size: 8pt !important;" +
			"}" +
		"#GM_fip_pop > tbody > tr > td > blockquote {" +
			"  margin-top: 0px !important;" +
			"  argin-bottom: 0px !important;" +
			"}" +
		".GM_fip_name {" +
			"  color: #F00;" +
			"}" +
		".GM_fip_counter {" +
		  "  margin: 0 0.3em" +
		"}";
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
