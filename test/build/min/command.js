(function(a){var b=(typeof exports==='object'),c=(typeof JS==='undefined')?require('./core'):JS,e=c.Enumerable||require('./enumerable').Enumerable,d=c.Observable||require('./observable').Observable;if(b)exports.JS=exports;a(c,e,d,b?exports:c)})(function(d,f,h,i){'use strict';var j=new d.Class('Command',{initialize:function(a){if(typeof a==='function')a={execute:a};this._2=a;this._0=this._2.stack||null},execute:function(a){if(this._0)this._0._3();var b=this._2.execute;if(b)b.apply(this);if(this._0&&a!==false)this._0.push(this)},undo:function(){var g=this._2.undo;if(g)g.apply(this)},extend:{Stack:new d.Class({include:[h||{},f||{}],initialize:function(a){a=a||{};this._1=a.redo||null;this.clear()},forEach:function(a,b){if(!a)return this.enumFor('forEach');a=f.toFn(a);for(var c=0,e=this._0.length;c<e;c++){if(this._0[c]!==undefined)a.call(b||null,this._0[c],c)}return this},clear:function(){this._0=[];this.length=this.pointer=0},_3:function(){if(this.pointer===0&&this._1&&this._1.execute)this._1.execute()},push:function(a){this._0.splice(this.pointer,this.length);this._0.push(a);this.length=this.pointer=this._0.length;if(this.notifyObservers)this.notifyObservers(this)},stepTo:function(a){if(a<0||a>this.length)return;var b,c;switch(true){case a>this.pointer:for(b=this.pointer,c=a;b<c;b++)this._0[b].execute(false);break;case a<this.pointer:if(this._1&&this._1.execute){this._1.execute();for(b=0,c=a;b<c;b++)this._0[b].execute(false)}else{for(b=0,c=this.pointer-a;b<c;b++)this._0[this.pointer-b-1].undo()}break}this.pointer=a;if(this.notifyObservers)this.notifyObservers(this)},undo:function(){this.stepTo(this.pointer-1)},redo:function(){this.stepTo(this.pointer+1)}})}});i.Command=j});
//@ sourceMappingURL=command.js.map