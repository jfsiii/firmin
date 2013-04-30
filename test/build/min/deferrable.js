(function(b){var a=(typeof exports==='object'),c=(typeof JS==='undefined')?require('./core'):JS;if(a)exports.JS=exports;b(c,a?exports:c)})(function(d,g){'use strict';var f=new d.Module('Deferrable',{extend:{Timeout:new d.Class(Error)},callback:function(b,a){if(this.__deferredStatus__==='success')return b.apply(a||null,this.__deferredValue__);if(this.__deferredStatus__==='failure')return;this.__callbacks__=this.__callbacks__||[];this.__callbacks__.push([b,a||null])},errback:function(b,a){if(this.__deferredStatus__==='failure')return b.apply(a||null,this.__deferredValue__);if(this.__deferredStatus__==='success')return;this.__errbacks__=this.__errbacks__||[];this.__errbacks__.push([b,a||null])},timeout:function(b){this.cancelTimeout();var a=this,c=new f.Timeout();this.__timeout__=d.ENV.setTimeout(function(){a.fail(c)},b)},cancelTimeout:function(){if(!this.__timeout__)return;d.ENV.clearTimeout(this.__timeout__);delete this.__timeout__},setDeferredStatus:function(b,a){this.__deferredStatus__=b;this.__deferredValue__=a;this.cancelTimeout();switch(b){case'success':if(!this.__callbacks__)return;var c;while(c=this.__callbacks__.pop())c[0].apply(c[1],a);break;case'failure':if(!this.__errbacks__)return;var e;while(e=this.__errbacks__.pop())e[0].apply(e[1],a);break}},succeed:function(){return this.setDeferredStatus('success',arguments)},fail:function(){return this.setDeferredStatus('failure',arguments)}});g.Deferrable=f});
//@ sourceMappingURL=deferrable.js.map