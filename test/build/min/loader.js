var JS=(typeof this.JS==='undefined')?{}:this.JS;JS.Date=Date;(function(a){var b=(typeof this.global==='object')?this.global:this,c=(typeof exports==='object');if(c){exports.JS=exports;JS=exports}else{b.JS=JS}a(b,JS)})(function(s,m){'use strict';var d=function(a){d._6(this);this._0=a;this._4=new p();this._7=new p();this._f=new p();this._g=new p();this._5={};this._8={}};d.displayName='Package';d.toString=function(){return d.displayName};d.log=function(a){if(!m.debug)return;if(typeof window==='undefined')return;if(typeof s.runtime==='object')runtime.trace(a);if(s.console&&console.info)console.info(a)};var t=function(a){if(/^https?:/.test(a))return a;var b=m.WEB_ROOT;if(b)a=(b+'/'+a).replace(/\/+/g,'/');return a};var p=function(a){this._h=this.list=[];this._6={};if(!a)return;for(var b=0,c=a.length;b<c;b++)this.push(a[b])};p.prototype.push=function(a){var b=(a.id!==undefined)?a.id:a,c=this._6;if(c.hasOwnProperty(b))return;c[b]=this._h.length;this._h.push(a)};var u=d.Deferred=function(){this._i='deferred';this._j=null;this._k=[]};u.prototype.callback=function(a,b){if(this._i==='succeeded')a.call(b,this._j);else this._k.push([a,b])};u.prototype.succeed=function(a){this._i='succeeded';this._j=a;var b;while(b=this._k.shift())b[0].call(b[1],a)};d.ENV=m.ENV=s;d.onerror=function(a){throw a};d._l=function(a){d.onerror(new Error(a));};var n=d.prototype,v=[['requires','_7'],['uses','_f']],o=v.length;while(o--)(function(pair){var y=pair[0],z=pair[1];n[y]=function(){var a=arguments.length,b;for(b=0;b<a;b++)this[z].push(arguments[b]);return this}})(v[o]);n.provides=function(){var a=arguments.length,b;for(b=0;b<a;b++){this._4.push(arguments[b]);d._9(arguments[b]).pkg=this}return this};n.styling=function(){for(var a=0,b=arguments.length;a<b;a++)this._g.push(t(arguments[a]))};n.setup=function(a){this._m=a;return this};n._s=function(a,b,c){if(this._8[a])return b.call(c);var f=this._5[a]=this._5[a]||[];f.push([b,c]);this._t()};n._3=function(a){if(this._8[a])return false;this._8[a]=true;var b=this._5[a];if(!b)return true;delete this._5[a];for(var c=0,f=b.length;c<f;c++)b[c][0].call(b[c][1]);return true};n._a=function(a){if(!a&&this.__isLoaded!==undefined)return this.__isLoaded;var b=this._4.list,c=b.length,f,g;while(c--){f=b[c];g=d._1(f,this._n);if(g!==undefined)continue;if(a)return d._l('Expected package at '+this._0+' to define '+f);else return this.__isLoaded=false}return this.__isLoaded=true};n._t=function(){if(!this._3('request'))return;if(!this._a())this._u();var j=this._7.list.concat(this._f.list),i=this._b||[],k=(this._0||{}).length,l=this;d.when({load:j});d.when({complete:this._7.list},function(){d.when({complete:j,load:[this]},function(){this._3('complete')},this);var c=function(a){if(k===0)return f(a);k-=1;var b=l._0.length-k-1;d.loader.loadFile(l._0[b],c,i[b])};var f=function(a){l._n=a;if(l._m)l._m();l._a(true);l._3('load')};if(this._a()){this._3('download');return this._3('load')}if(this._0===undefined)return d._l('No load path found for '+this._4.list[0]);if(typeof this._0==='function')this._0(f);else c();if(!d.loader.loadStyle)return;var g=this._g.list,h=g.length;while(h--)d.loader.loadStyle(g[h]);this._3('download')},this)};n._u=function(){if(this._b||!(this._0 instanceof Array)||!d.loader.fetch)return;this._b=[];for(var a=0,b=this._0.length;a<b;a++)this._b[a]=d.loader.fetch(this._0[a])};n.toString=function(){return'Package:'+this._4.list.join(',')};d.when=function(a,b,c){var f=[],g={},h,j,i;for(h in a){if(!a.hasOwnProperty(h))continue;g[h]=[];j=new p(a[h]);i=j.list.length;while(i--)f.push([h,j.list[i],i])}var k=i=f.length;if(k===0)return b&&b.call(c,g);while(i--)(function(h){var l=d._c(h[1]);l._s(h[0],function(){g[h[0]][h[2]]=d._1(h[1],l._n);k-=1;if(k===0&&b)b.call(c,g)})})(f[i])};d._o=1;d._d={};d._e={};d._p=[];d._6=function(a){a.id=this._o;this._o+=1};d._q=function(a){var b=a.toString(),c=this._d[b];if(c)return c;if(typeof a==='string')a=[].slice.call(arguments);c=this._d[b]=new this(a);return c};d._c=function(a){if(typeof a!=='string')return a;var b=this._9(a);if(b.pkg)return b.pkg;var c=this._v(a);if(c)return c;var f=new this();f.provides(a);return f};d.remove=function(a){var b=this._c(a);delete this._e[a];delete this._d[b._0]};d._w=function(a,b){this._p.push([a,b])};d._v=function(f){var g=this._p,h=g.length,j,i,k;for(j=0;j<h;j++){i=g[j];if(!i[0].test(f))continue;k=i[1].from+'/'+f.replace(/([a-z])([A-Z])/g,function(a,b,c){return b+'_'+c}).replace(/\./g,'/').toLowerCase()+'.js';var l=new this([k]);l.provides(f);if(k=i[1].require)l.requires(f.replace(i[0],k));return l}return null};d._9=function(a){return this._e[a]=this._e[a]||{}};d._1=function(a,b){if(typeof a!=='string')return undefined;var c=b?{}:this._9(a);if(c.obj!==undefined)return c.obj;var f=b||this.ENV,g=a.split('.'),h;while(h=g.shift())f=f&&f[h];if(b&&f===undefined)return this._1(a);return c.obj=f};d.CommonJSLoader={usable:function(){return typeof require==='function'&&typeof m==='object'},__FILE__:function(){return this._2},loadFile:function(a,b){var c;if(typeof process!=='undefined'){var f=process.cwd(),g=a.replace(/\.[^\.]+$/g,''),a=require('path');c=a.resolve(g)}else if(typeof phantom!=='undefined'){c=phantom.libraryPath.replace(/\/$/,'')+'/'+a.replace(/^\//,'')}this._2=c+'.js';var g=require(c);b(g);return g}};d.BrowserLoader={HOST_REGEX:/^(https?\:)?\/\/[^\/]+/i,usable:function(){return!!d._1('window.document.getElementsByTagName')&&typeof phantom==='undefined'},__FILE__:function(){var a=document.getElementsByTagName('script'),b=a[a.length-1].src,c=window.location.href;if(/^\w+\:\/+/.test(b))return b;if(/^\//.test(b))return window.location.origin+b;return c.replace(/[^\/]*$/g,'')+b},cacheBust:function(a){if(m.cache!==false)return a;var b=new JS.Date().getTime();return a+(/\?/.test(a)?'&':'?')+b},fetch:function(a){var b=a;a=this.cacheBust(a);this.HOST=this.HOST||this.HOST_REGEX.exec(window.location.href);var c=this.HOST_REGEX.exec(a);if(!this.HOST||(c&&c[0]!==this.HOST[0]))return null;d.log('[FETCH] '+a);var f=new d.Deferred(),g=this,h=window.ActiveXObject?new ActiveXObject('Microsoft.XMLHTTP'):new XMLHttpRequest();h.open('GET',a,true);h.onreadystatechange=function(){if(h.readyState!==4)return;h.onreadystatechange=g._r;f.succeed(h.responseText+'\n//@ sourceURL='+b);h=null};h.send(null);return f},loadFile:function(c,f,g){if(!g)c=this.cacheBust(c);var h=this,j=document.getElementsByTagName('head')[0],i=document.createElement('script');i.type='text/javascript';if(g)return g.callback(function(code){d.log('[EXEC]  '+c);var k=new Function('code','eval(code)');k(code);f()});d.log('[LOAD] '+c);i.src=c;i.onload=i.onreadystatechange=function(){var a=i.readyState,b=i.status;if(!a||a==='loaded'||a==='complete'||(a===4&&b===200)){f();i.onload=i.onreadystatechange=h._r;j=null;i=null}};j.appendChild(i)},loadStyle:function(a){var b=document.createElement('link');b.rel='stylesheet';b.type='text/css';b.href=this.cacheBust(a);document.getElementsByTagName('head')[0].appendChild(b)},_r:function(){}};d.RhinoLoader={usable:function(){return typeof java==='object'&&typeof require==='function'},__FILE__:function(){return this._2},loadFile:function(a,b){var c=java.lang.System.getProperty('user.dir'),f=a.replace(/\.[^\.]+$/g,'');var g=new java.io.File(c,f).toString();this._2=g+'.js';var f=require(g);b(f);return f}};d.ServerLoader={usable:function(){return typeof d._1('load')==='function'&&typeof d._1('version')==='function'},__FILE__:function(){return this._2},loadFile:function(a,b){this._2=a;load(a);b()}};d.WshLoader={usable:function(){return!!d._1('ActiveXObject')&&!!d._1('WScript')},__FILE__:function(){return this._2},loadFile:function(a,b){this._2=a;var c=new ActiveXObject('Scripting.FileSystemObject'),f,g;try{f=c.OpenTextFile(a);g=function(){eval(f.ReadAll())};g();b()}finally{try{if(f)f.Close()}catch(e){}}}};d.XULRunnerLoader={jsloader:'@mozilla.org/moz/jssubscript-loader;1',cssservice:'@mozilla.org/content/style-sheet-service;1',ioservice:'@mozilla.org/network/io-service;1',usable:function(){try{var a=(Components||{}).classes;return!!(a&&a[this.jsloader]&&a[this.jsloader].getService)}catch(e){return false}},setup:function(){var a=Components.classes,b=Components.interfaces;this.ssl=a[this.jsloader].getService(b.mozIJSSubScriptLoader);this.sss=a[this.cssservice].getService(b.nsIStyleSheetService);this.ios=a[this.ioservice].getService(b.nsIIOService)},loadFile:function(a,b){d.log('[LOAD] '+a);this.ssl.loadSubScript(a);b()},loadStyle:function(a){var b=this.ios.newURI(a,null,null);this.sss.loadAndRegisterSheet(b,this.sss.USER_SHEET)}};var w=[d.XULRunnerLoader,d.RhinoLoader,d.BrowserLoader,d.CommonJSLoader,d.ServerLoader,d.WshLoader],A=w.length,o,r;for(o=0;o<A;o++){r=w[o];if(r.usable()){d.loader=r;if(r.setup)r.setup();break}}var q={__FILE__:function(){return d.loader.__FILE__()},pkg:function(a,b){var c=b?d._q(b):d._c(a);c.provides(a);return c},file:function(a){var b=[],c=arguments.length;while(c--)b[c]=t(arguments[c]);return d._q.apply(d,b)},load:function(a,b){d.loader.loadFile(a,b)},autoload:function(a,b){d._w(a,b)}};q.files=q.file;q.loader=q.file;var B=function(a){a.call(q)};var x=function(a){var b=[],c=0;while(typeof a[c]==='string'){b.push(a[c]);c+=1}return{files:b,callback:a[c],context:a[c+1]}};m.load=function(b,c){var f=x(arguments),g=f.files.length;var h=function(a){if(a===g)return f.callback.call(f.context||null);d.loader.loadFile(f.files[a],function(){h(a+1)})};h(0)};m.require=function(){var b=x(arguments);d.when({complete:b.files},function(a){if(!b.callback)return;b.callback.apply(b.context||null,a&&a.complete)});return this};m.Package=d;m.Packages=m.packages=B;m.DSL=q});(function(){var g=(typeof exports==='object'),h=(g?exports:JS),j=h.Package;h.packages(function(){with(this){j.ENV.JSCLASS_PATH=j.ENV.JSCLASS_PATH||__FILE__().replace(/[^\/]*$/g,'');var b=j.ENV.JSCLASS_PATH;if(!/\/$/.test(b))b=b+'/';var c=function(a){return file(b+a+'.js')};c('core').provides('JS','JS.Module','JS.Class','JS.Method','JS.Kernel','JS.Singleton','JS.Interface');var f='JS.Test.Unit';c('test').provides('JS.Test','JS.Test.Context','JS.Test.Mocking','JS.Test.FakeClock','JS.Test.AsyncSteps','JS.Test.Helpers',f,f+'.Assertions',f+'.TestCase',f+'.TestSuite',f+'.TestResult').requires('JS.Module','JS.Class','JS.Console','JS.DOM','JS.Enumerable','JS.SortedSet','JS.Range','JS.Hash','JS.MethodChain','JS.Comparable','JS.StackTrace').styling(b+'assets/testui.css');c('dom').provides('JS.DOM','JS.DOM.Builder').requires('JS.Class');c('console').provides('JS.Console').requires('JS.Module','JS.Enumerable');c('benchmark').provides('JS.Benchmark').requires('JS.Module').requires('JS.Console');c('comparable').provides('JS.Comparable').requires('JS.Module');c('constant_scope').provides('JS.ConstantScope').requires('JS.Module');c('forwardable').provides('JS.Forwardable').requires('JS.Module');c('enumerable').provides('JS.Enumerable').requires('JS.Module','JS.Class');c('deferrable').provides('JS.Deferrable').requires('JS.Module');c('observable').provides('JS.Observable').requires('JS.Module');c('hash').provides('JS.Hash','JS.OrderedHash').requires('JS.Class','JS.Enumerable','JS.Comparable');c('range').provides('JS.Range').requires('JS.Class','JS.Enumerable','JS.Hash');c('set').provides('JS.Set','JS.HashSet','JS.OrderedSet','JS.SortedSet').requires('JS.Class','JS.Enumerable','JS.Hash');c('linked_list').provides('JS.LinkedList','JS.LinkedList.Doubly','JS.LinkedList.Doubly.Circular').requires('JS.Class','JS.Enumerable');c('command').provides('JS.Command','JS.Command.Stack').requires('JS.Class','JS.Enumerable','JS.Observable');c('decorator').provides('JS.Decorator').requires('JS.Module','JS.Class');c('method_chain').provides('JS.MethodChain').requires('JS.Module','JS.Kernel');c('proxy').provides('JS.Proxy','JS.Proxy.Virtual').requires('JS.Module','JS.Class');c('stack_trace').provides('JS.StackTrace').requires('JS.Module','JS.Singleton','JS.Observable','JS.Enumerable','JS.Console');c('state').provides('JS.State').requires('JS.Module','JS.Class');c('tsort').provides('JS.TSort').requires('JS.Module').requires('JS.Class').requires('JS.Hash')}})})();
//@ sourceMappingURL=loader.js.map