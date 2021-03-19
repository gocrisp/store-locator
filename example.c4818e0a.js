parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"fojl":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Loader=exports.DEFAULT_ID=void 0;var t=function t(e,i){if(e===i)return!0;if(e&&i&&"object"==typeof e&&"object"==typeof i){if(e.constructor!==i.constructor)return!1;var s,r,n;if(Array.isArray(e)){if((s=e.length)!=i.length)return!1;for(r=s;0!=r--;)if(!t(e[r],i[r]))return!1;return!0}if(e.constructor===RegExp)return e.source===i.source&&e.flags===i.flags;if(e.valueOf!==Object.prototype.valueOf)return e.valueOf()===i.valueOf();if(e.toString!==Object.prototype.toString)return e.toString()===i.toString();if((s=(n=Object.keys(e)).length)!==Object.keys(i).length)return!1;for(r=s;0!=r--;)if(!Object.prototype.hasOwnProperty.call(i,n[r]))return!1;for(r=s;0!=r--;){var o=n[r];if(!t(e[o],i[o]))return!1}return!0}return e!=e&&i!=i};const e="__googleMapsScriptId";exports.DEFAULT_ID=e;class i{constructor({apiKey:s,channel:r,client:n,id:o=e,libraries:a=[],language:l,region:h,version:c,mapIds:d,nonce:g,retries:p=3,url:u="https://maps.googleapis.com/maps/api/js"}){if(this.CALLBACK="__googleMapsCallback",this.callbacks=[],this.done=!1,this.loading=!1,this.errors=[],this.version=c,this.apiKey=s,this.channel=r,this.client=n,this.id=o||e,this.libraries=a,this.language=l,this.region=h,this.mapIds=d,this.nonce=g,this.retries=p,this.url=u,i.instance){if(!t(this.options,i.instance.options))throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(i.instance.options)}`);return i.instance}i.instance=this}get options(){return{version:this.version,apiKey:this.apiKey,channel:this.channel,client:this.client,id:this.id,libraries:this.libraries,language:this.language,region:this.region,mapIds:this.mapIds,nonce:this.nonce,url:this.url}}createUrl(){let t=this.url;return t+=`?callback=${this.CALLBACK}`,this.apiKey&&(t+=`&key=${this.apiKey}`),this.channel&&(t+=`&channel=${this.channel}`),this.client&&(t+=`&client=${this.client}`),this.libraries.length>0&&(t+=`&libraries=${this.libraries.join(",")}`),this.language&&(t+=`&language=${this.language}`),this.region&&(t+=`&region=${this.region}`),this.version&&(t+=`&v=${this.version}`),this.mapIds&&(t+=`&map_ids=${this.mapIds.join(",")}`),t}load(){return this.loadPromise()}loadPromise(){return new Promise((t,e)=>{this.loadCallback(i=>{i?e(i):t()})})}loadCallback(t){this.callbacks.push(t),this.execute()}setScript(){if(document.getElementById(this.id))return void this.callback();const t=this.createUrl(),e=document.createElement("script");e.id=this.id,e.type="text/javascript",e.src=t,e.onerror=this.loadErrorCallback.bind(this),e.defer=!0,e.async=!0,this.nonce&&(e.nonce=this.nonce),document.head.appendChild(e)}deleteScript(){const t=document.getElementById(this.id);t&&t.remove()}resetIfRetryingFailed(){const t=this.retries+1;this.done&&!this.loading&&this.errors.length>=t&&(this.deleteScript(),this.done=!1,this.loading=!1,this.errors=[],this.onerrorEvent=null)}loadErrorCallback(t){if(this.errors.push(t),this.errors.length<=this.retries){const t=this.errors.length*Math.pow(2,this.errors.length);console.log(`Failed to load Google Maps script, retrying in ${t} ms.`),setTimeout(()=>{this.deleteScript(),this.setScript()},t)}else this.onerrorEvent=t,this.callback()}setCallback(){window.__googleMapsCallback=this.callback.bind(this)}callback(){this.done=!0,this.loading=!1,this.callbacks.forEach(t=>{t(this.onerrorEvent)}),this.callbacks=[]}execute(){window.google&&window.google.maps&&window.google.maps.version&&(console.warn("Google Maps already loaded outside @googlemaps/js-api-loader.This may result in undesirable behavior as options and script parameters may not match."),this.callback()),this.resetIfRetryingFailed(),this.done?this.callback():this.loading||(this.loading=!0,this.setCallback(),this.setScript())}}exports.Loader=i;
},{}],"QCba":[function(require,module,exports) {
"use strict";var e=require("@googlemaps/js-api-loader");document.addEventListener("DOMContentLoaded",function(){var n=new e.Loader({apiKey:"AIzaSyDdH3QeHDu3XGXwcIF9sMHQmbn2YS4N4Kk",version:"weekly"}),o=document.getElementById("map-container");if(o)return n.load().then(function(){var e=new google.maps.Map(o,{center:{lat:39.8283,lng:-98.5795},zoom:4}),n=new google.maps.Marker({position:{lat:34.397,lng:-80.644},map:e}),t=new google.maps.InfoWindow({content:"<p>Marker Location: "+n.getPosition()+"</p>"});return google.maps.event.addListener(n,"click",function(){return t.open(e,n)}),e})});
},{"@googlemaps/js-api-loader":"fojl"}]},{},["QCba"], null)
//# sourceMappingURL=/store-locator/example.c4818e0a.js.map