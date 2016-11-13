// ==UserScript==
// @name           futaba ID+IP popup
// @namespace      https://github.com/himuro-majika
// @description    同じIDやIPのレスをポップアップしちゃう
// @author         himuro_majika
// @include        http://*.2chan.net/*/res/*.htm
// @include        https://*.2chan.net/*/res/*.htm
// @version        1.2.2
// @grant          GM_addStyle
// @run-at      document-idle
// @license        MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAPUExURYv4i2PQYy2aLUe0R////zorx9oAAAAFdFJOU/////8A+7YOUwAAAElJREFUeNqUj1EOwDAIQoHn/c88bX+2fq0kRsAoUXVAfwzCttWsDWzw0kNVWd2tZ5K9gqmMZB8libt4pSg6YlO3RnTzyxePAAMAzqMDgTX8hYYAAAAASUVORK5CYII=
// ==/UserScript==
(function () {
	var USE_COUNTER = true;	// IDカウンターを表示する
	// USE_COUNTER = false;
	var USE_COUNTER_CURRENT = true;	// IDカウンターに現在の出現数を表示
	// USE_COUNTER_CURRENT = false;

	var Start = new Date().getTime();//count parsing time
	var saba = location.host.replace(".2chan.net","") +
		location.pathname.replace("futaba.htm","");
	var timer_show, timer_hide;
	var isIDIPThread = checkThreadMail();

	setClassAndNameThread();
	setClassAndNameRes();
	if (USE_COUNTER) {
		createCounter();
	}
	setEvent();
	setStyle();
	observeInserted();

	// ID表示・IP表示スレかどうか
	function checkThreadMail() {
		var mail = document.querySelector("html > body > form > font > b > a");
		if (mail && mail.href.match(/^mailto:i[dp]/i)) {
			return true;
		} else {
			return false;
		}
	}
	// ID/IPにclass,nameを設定する
	// 本文
	function setClassAndNameThread() {
		var form = document.querySelector(".thre") ?
			document.querySelector(".thre") :
			document.querySelector("html > body > form:not([enctype])");
		for (var i = 0; i < form.childNodes.length; i++) {
			var text = form.childNodes[i];
			if (text.tagName == "BLOCKQUOTE") {
				break;
			} else if (text.nodeValue) {
				var matchText = text.nodeValue.match(/(.+)(I[DP]:\S{8})(.*)/);
				if (matchText) {
					var date = document.createTextNode(matchText[1]);
					var id = matchText[2];
					var no = document.createTextNode(matchText[3]);
					var ida = document.createElement("a");
					ida.textContent = id;
					ida.setAttribute("class", "GM_fip_name GM_fip_name_thread");
					ida.setAttribute("name", id);
					text.parentNode.insertBefore(date, text);
					text.parentNode.insertBefore(ida, text);
					text.parentNode.insertBefore(no, text);
					text.parentNode.removeChild(text);
					break;
				}
			}
		}
	}
	// レス
	function setClassAndNameRes(node) {
		var atd = document.getElementsByClassName("rtd");
		if (arguments.length) {
			atd = node;
		}
		for (var i = 0; i < atd.length; i++) {
			var td = atd[i];
			for (var j = 0; j < td.childNodes.length; j++) {
				var text = td.childNodes[j];
				if (text.tagName == "BLOCKQUOTE") {
					break;
				} else if (text.nodeValue) {
					var matchText = text.nodeValue.match(/(.+)(I[DP]:\S{8})(.*)/);
					if (matchText) {
						var date = document.createTextNode(matchText[1]);
						var id = matchText[2];
						var no = document.createTextNode(matchText[3]);
						var ida = document.createElement("a");
						ida.textContent = id;
						ida.setAttribute("class", "GM_fip_name");
						ida.setAttribute("name", id);
						text.parentNode.insertBefore(date, text);
						text.parentNode.insertBefore(ida, text);
						text.parentNode.insertBefore(no, text);
						text.parentNode.removeChild(text);
						break;
					}
				}
			}
		}
	}
	// 出現数の表示
	function createCounter() {
		// return;
		var a = document.getElementsByClassName("GM_fip_name");
		var ids = {};
		for (var i = 0; i < a.length; i++) {
			var node = a[i];
			var id = node.name;
			if (USE_COUNTER_CURRENT) {
				if (ids[id]) {
					ids[id]++;
				} else {
					ids[id] = 1;
				}
			}
			// var name = document.querySelectorAll(".GM_fip_name[name='" + id + "']");
			var name = document.getElementsByName(id);
			var span;
			if (node.childNodes[1]) {
			// if (node.nextSibling.tagName == "SPAN") {
				// console.log(node.childNodes.length);
				// node.removeChild(node.childNodes[1]);
				span = node.childNodes[1];
				// span = node.nextSibling;
			} else {
				span = document.createElement("span");
				node.appendChild(span);
				// node.parentNode.insertBefore(span, node.nextSibling);
				span.setAttribute("class", "GM_fip_counter");
			}
			if (USE_COUNTER_CURRENT) {
				span.textContent = "[" + ids[id] + "/" + name.length + "]";
			} else {
				span.textContent = "[" + name.length + "]";
			}
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
			var popup = document.createElement("div");
			popup.setAttribute("style", "visibility: hidden;");
			var divThread = document.createElement("div");
			var table = document.createElement("table");
			var tbody = document.createElement("tbody");
			popup.appendChild(divThread);
			popup.appendChild(table);
			table.appendChild(tbody);
			var tda = document.getElementsByName(name);
			for (var i = 0; i < tda.length; i++) {
				if (tda[i].classList.contains("GM_fip_name_thread")) {
					// スレ
					var form = tda[i].parentNode.cloneNode(true);
					for (var j = 0; j < form.childNodes.length; j++) {
						// 広告
						if (form.childNodes[j].className !== "tue") {
							divThread.appendChild(form.childNodes[j].cloneNode(true));
						}
						if (form.childNodes[j].tagName == "BLOCKQUOTE") {
							break;
						}
					}
				} else {
					// レス
					var tr = tda[i].parentNode.parentNode.cloneNode(true);
					tbody.appendChild(tr);
				}
			}
			var restable = [];
			popup.id = "GM_fip_pop";
			popup.setAttribute("class", "GM_fip_pop akahuku_reply_popup");
			popup.setAttribute("__akahuku_reply_popup_index", "");
			// popup.innerHTML = restable.join(" ");
			popup.addEventListener("mouseover",function() {
				clearTimeout(timer_hide);
			}, true);
			popup.addEventListener("mouseout",hide,true);
			var body = document.getElementsByTagName("body");
			body[0].appendChild(popup);
			wX = event.clientX + 10;
			wY = window.scrollY + event.clientY - popup.clientHeight - 10;
			if ( wY < 0 ) {	//ポップアップが上に見きれる時は下に表示
				wY = window.scrollY + event.clientY;
			}
			popup.setAttribute("style",
				"left:" + wX + "px; top:" + wY + "px; visibility: visible;");
		}, 100);
	}
	// ポップアップを消す
	function hide() {
		clearTimeout(timer_show);
		clearTimeout(timer_hide);
		timer_hide = setTimeout(delpop, 500);
	}

	function delpop() {
		clearTimeout(timer_hide);
		var doc_pop = document.getElementsByClassName("GM_fip_pop");
		if ( doc_pop ) {
			for (var i = 0; i < doc_pop.length; i++) {
				doc_pop[i].parentNode.removeChild(doc_pop[i]);
			}
		}
	}
	/*
	 * スタイル設定
	 */
	function setStyle() {
		var css = ".GM_fip_pop {" +
		"  position: absolute;" +
		"  z-index: 350;" +
		"  background-color: #eeaa88 !important;"+
		"}" +
		// ".GM_fip_pop > form {" +
		// "  background-color: #ffe" +
		// "}" +
		".GM_fip_pop > table {" +
		"  clear: both;" +
		"}" +
		".GM_fip_pop > div," +
		".GM_fip_pop > table > tbody > tr > td {" +
		"  color: #800000;" +
		"  font-size: 8pt !important;" +
		"}" +
		".GM_fip_pop > div," +
		".GM_fip_pop > table > tbody > tr > td > blockquote {" +
		"  margin-top: 0px !important;" +
		"  margin-bottom: 0px !important;" +
		"}" +
		".GM_fip_name {" +
		"  color: #F00;" +
		// "  font-family: monospace;" +
		"}" +
		".GM_fip_counter {" +
		"  margin: 0 0.3em;" +
		// "  color: #cc1105;" +
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
	// 続きを読むで追加されるレスを監視
	function observeInserted() {
		observeReloadStatus();
		var target = document.querySelector(".thre") ?
			document.querySelector(".thre") :
			document.querySelector("html > body > form[action]:not([enctype])");
		var timer_reload;
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				delpop();
				var nodes = mutation.addedNodes;
				for (var i = 0; i < nodes.length; i++) {
					// console.log(nodes[i]);
					if (
						nodes[i].tagName == "TABLE" &&
						nodes[i].id !== "akahuku_bottom_container"
					) {
						if (isIDIPThread) {
							setClassAndNameRes(nodes[i].childNodes[0].childNodes[0].childNodes);
						}
						clearTimeout(timer_reload);
						timer_reload = setTimeout(rel, 50);
					}
				}
			});
		});
		observer.observe(target, { childList: true });
		function rel() {
			if (!isIDIPThread) {
				setClassAndNameThread();
				setClassAndNameRes();
			}
			createCounter();
			setEvent();
		}
	}
	// 赤福のリロード状態を監視
	function observeReloadStatus() {
		var target = document.getElementById("akahuku_reload_status");
		if (!target) {
			return;
		}
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				delpop();
			});
		});
		observer.observe(target, { childList: true });
	}
	console.log('Parsing '+saba+': '+((new Date()).getTime()-Start) +'msec');//log parsing time
})();
