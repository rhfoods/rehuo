(this["webpackJsonpupload-react"]=this["webpackJsonpupload-react"]||[]).push([[0],{14:function(e,t,n){},16:function(e,t,n){},17:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n(2),r=n.n(i),c=n(6),o=n.n(c),A=(n(14),n(1)),s=n.n(A),l=n(3),p=n(5),u=(n(16),n(7)),d=n(8),g=function(){function e(){Object(u.a)(this,e)}return Object(d.a)(e,null,[{key:"decodeParam",value:function(){for(var e={},t=decodeURI(window.location.href).split("?")[1].split("&"),n=0;n<t.length;n++){var a=t[n].split("=");e[a[0]]=a[1]}return e}},{key:"getParams",value:function(){var t=e.decodeParam();e.region="oss-cn-chengdu",e.bucket=t.bucket,e.api="https://"+t.url+"/api/v1/media",e.token=t.token}},{key:"initOSSClient",value:function(){var t=Object(l.a)(s.a.mark((function t(){var n,a,i,r;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.getCredential();case 2:n=t.sent,a=n.AccessKeyId,i=n.AccessKeySecret,r=n.SecurityToken,e.ossClient=new window.OSS({accessKeyId:a,accessKeySecret:i,stsToken:r,bucket:e.bucket,region:e.region});case 5:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}()},{key:"getCredential",value:function(){var t=Object(l.a)(s.a.mark((function t(){var n,a,i,r;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=e.api,a=e.token,t.next=3,window.OSS.urllib.request(n,{method:"POST",data:JSON.stringify({type:"PV",counts:1}),headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(a)}});case 3:return i=t.sent,r=JSON.parse(i.data),e.fileName=r.medias[0],t.abrupt("return",r.sts);case 7:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}()}]),e}();g.partSize=1048576,g.maxSize=209715200,g.parallel=3,g.tryCount=3,g.checkpoints={};var k=g,m="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAPCElEQVR4Xu2defB/1RjH3++RZaxjaTNlUkNopUkiLaJII21SKjViWmiRJDRiQmLaTL9UUsRQaUEbkqIwoxrajCxJUQlFjCzN2zy533z79V0+99xz7+fee95n5jPf3x/nec7zvJ/z+t3P5957ziHcrIAVmFcBWhsrYAXmV8CAeHZYgQUUMCCeHlbAgHgOWIE0BXwFSdPNVoUoYEAKKbTTTFPAgKTpZqtCFDAghRTaaaYpYEDSdLNVIQoYkEIK7TTTFDAgabrZqhAFDEghhXaaaQoYkDTdbFWIAgakkEI7zTQFDEiabrYqRAEDUkihnWaaAgYkTTdbFaKAASmk0E4zTQEDkqabrQpRwIAUUminmaaAAUnTzVaFKGBACim000xTwICk6WarQhQwIIUU2mmmKWBA0nSzVSEKGJBCCu000xQwIGm62aoQBQxIIYV2mmkKGJA03WxViAIGpJBCO800BQxImm62KkQBA1JIoZ1mmgIGJE03WxWigAEppNBOM00BA5Kmm60KUcCAFFJop5mmgAFJ081WhShgQAoptNNMU8CApOlmq0IUMCCFFNpppilgQNJ0s1UhChiQQgrtNNMUMCBputmqEAUMyAALLWldAKsCWAHAitXf+PeT50nnZgA3AXjoL8l7Bpj2VEI2IFORvd6gktYBsPGsz3L1PDyqdwASwHwRwPkk/9zQ32jNDUiPSytpNwC7Atii5TDPAvANAJcYlkcqbUBannl13UtaHkCAEZ+169o37H8vgHMAnELy2oa+RmFuQHpSRkmPAXBg9VmpB2GdYlAAA9KDmShplwqM9XsQztIhBCgnkfxJD2NrPSQD0rrE8w8gaWUAxwHYbophTDL0fQA+TDJiLaoZkCmVW9JrABwLYI0phZAy7AUVKMVcTQxIyjRpaCPpndWVI353DK0VdTUxIB1PT0kfA3BYx8O2MdwJJA9ow3GffBqQDqsh6VQAe3U4ZNtDnU1yp7YHmaZ/A9KR+pJ+DeC5HQ3X5TBXkNysywG7HMuAdKC2pPje/rQOhprWEJeRjJsOo2sGpOWSSroewFotD9MH9/GsZN8+BJIzBgOSU82lfEm6EMDrWxyib67jWckRfQuqSTwGpIl6C9hKWgJgn5bc99ntqCAxIC1MNUnvA/DxFlwPxeXuJM8cSrALxWlAMlexeq/qS5ndDs3dLwBsQvLOoQW+dLwGJGMFq5V+3wTQdEFTxqim5moUP9oNSKb5I2kZAAHHqzK5HIOb7UmeN+REDEim6kk6HsD+mdyNxc11ADYk+a+hJmRAMlRO0ttjcVEGV2N0cSjJo4eamAFpWDlJG1ZfrZ7S0NVYzeOHelxFbhtiggakYdUkfQ3AGxq6Gbv5cSQPGmKSBqRB1apFT99q4KIk07VI3ji0hEcNiKSnAtiy+sTKvXhhcObzeACxi8fMJ3bxiK1v4u3UByYppKSvAth+kr7ugyNJHj40HUYHiKTYXTD2kop3oOIN0wChTotN1S4FEF+dvk7y33MZS9oIwPfrOC68bzw8XHNod7RGA4ik1aq9pAKO+HeOFms4TiR5zNLOJF0M4HU5BinIx+BeQRk8IJKeDiCWsQYY8+1N23QOxhUlviJcHY4kxTagVzZ1WqD9RSS3HlLegwZE0noAPh23ETsQ/cGABMCyAHas/nYw7OiGeAHJnw8lq8ECIikm6dlDEdpxPqzAwXN9Ze2rPoMERFLcbRrUpbqvE2AKcV1OcvMpjJs05OAAkRSvLRySlK2N+qLAOiRjKXLv26AAkRRXjbh6uA1bgfeTHMSCssEAIike8MVzhxI2QBj29F88+qtIvnLxbtPvMSRASl/GOv3ZkjeCl5L8cV6X+b0NCZBSts/JX+V+ehzE5g6DAMTrvPs5wxtGdS7JHRr6aN18KICUtr9U64XvwQC3kFy9B3EsGMJQAPlVdexx3/V0fPUUWJbkH+uZdNu794BUb+fe360sHq0jBTYneXlHYyUNMwRA1gRwQ1J2Nuq7Agf1/Vi3IQCyKYDv9r3Sji9Jgc+RfFuSZUdGBqQjoT3MnAr8kOTL+6yNAelzdcYf2x0k46Tf3rYhABJrPq7prYIOrKkCj5tvWXNTxznshwDIigB+nyNZ++ilAquRjKXNvWy9ByRUk6RequegciiwKcneLl8eCiA/BbB2jmrYR+8U2JVkb4+L6DUgkpYHEJ/9ALyjd6V1QDkUOIzkUTkcteGjN4BIiv2rYgvP2IDhZR1txNCGpvZZX4G/VJtvXDqzc0x9F+1YTB0QSXF2+FuqbXt6//JaO2Ww11kKxI4nXwFwch9OqJoaIJJWAfDeCgzvjG5GllYg7lyeOm1QpgKIpD0AfAhAQOJmBRZSYAaUY0j+tWupOgWkumoEGAGImxWoo8BNAI4leVodo6Z9OwNEUqwe+6SvGk1LVrx9nAMZoMTf1lsngEiKndbPB/DY1jMa/gA3AzgHwB+q29svGn5KrWQQV5L9SP6zFe+V09YBkRSnvgYccVaH28IK/AbANjObqklaJ45gAPAcCzenAvEEfoc2VyW2Ckh1fl8cA7yCC7yoAncDeCPJH83uKekV1Vklz1zUQ5kdfglgC5K3tpF+a4BIWhfAuV5LPlHZ4u5MwDHnwjBJW1SQPGEib+V1+kc8XG5jO9NWAJEUzzW+ByAgcVtYgTjBaluSFy3UTdK2AOJq7Da/AhvlfhLfFiCx72rshOi2uAI7koyzDhdtknYD8IVFO5bdYQ2ScaMjS8sOiKRN4iDMLNGN38lbSdaa8JL2BnDS+KVplGE2SNoAJO5Px3dmt4UV2JvkySkiSToYwKdSbAuxiYeKW5OMu4KNWlZAJMVh8Y868LJRhOM0fjfJY5ukJineSDiiiY+R255Bcs+mOWYDRNILqx/mz2oa1MjtP0AyDh1t3HyY0KIS7knyjEV7LdAhJyBnVm/mNoln7LYfJfnBnElKOhHAvjl9jshXfMWKO1u/S80pCyCSvLnb4hWIt1Hjt0P2JunzAHbP7ngcDo8ieVhqKrkAWQJgn9QgCrA7iWSr/8tLilvF2xegZd0U/wZgg9Rbv40BkRSvkdwIwK9CzF26LD8WJ5kVki4B8NpJ+hbW5zMkk/4DzwHI/gCOL0zwSdM9i+SbJ+2co5+kOMdxoxy+RuTjLpKxv1rtlgOQqwDEC3Vuj1QgTuONV0ge7FoYSdcBeHHX4/Z8vM1I1n6A3QiQ6iW6Thau9Fz8pcO7rIIjvv9OpUmKzQ+eP5XB+zlo0pmITQH5LIBeb18/hVpdDWA7krHgaapNUtzefPZUg+jP4FeQ3KxuOMmASIpFPPHj3DuS/F/1+GoTcNxWtxBt9Zd0H4A4Y770dj/J2ov2mgDynmqNeenCz+T/s7jNSjL+9qZJehKAgGSZ3gQ1vUBWJ3lLneGbAPID7374sNTxxDbgiCtI71q1hetdvQus+4B2IfnlOsMmAVI9+7izzkAj7htLZQOO+O3R2yZpVQBxWnDJrfYP9VRAtgFwQclKV7nHUtmAI+5a9b5JWgvA9b0PtL0AOwPkaACHtJfHIDzHUtmAI553DKZVG2nE1+MSW2eAXAvgJSUqPCvnN5GM/asG1wpet9M+INUxBQ8MblbkDzjbss78oS3sUdK7AJzQ9bg9GK8TQFYDEHsRld7izlXdJZ1Xksy6ClBS+It9AOq0NQAsW8dgJH13JhlHK0zcav9I99qPibWdq2Pt/8EWG60CJJbfui2uwPNI1vrPPQWQXQHE6kG3+goYkPqa5bK4m2TtHT5TAIn9rmLfK7f6ChiQ+prlsriYZGyiXqulAOJXTGpJ/IjOBiRdu6aWR5I8vK6TFED2qo7GqjuW+wMGZHqzIF4ijVMGarUUQOIgnEHe/6+lTDudDUg7uk7idWWSd0zScXafFEBeDeDbdQdy/4cUMCDTmQg3kFw7ZegUQOKd+jjX2q2+AgakvmY5LD5CMulWeG1AIlpJcY5F7IXlVk8BA1JPrxy9/xSvRZH8bYqzVEDi6W0SkSlBjsjGgHRfzKNJHpo6bCogWwK4NHXQgu0MSLfF/3t19ai1irDRj/QZY0lnA9ix23wHP5oB6baEJ5A8oMmQSVeQ6nfIxgDilFG3yRUwIJNr1bTnfwCs1/TcwmRAKkhOBRAPDt0mU8CATKZTjl4nk4zTuBq1poCsAiDuaMVft8UVMCCLa5SjRxylvRXJe5s6awRIdRXZA8DpTQMpxN6AdFPo9Ulek2OoxoBUkAQgAYrbwgoYkPZnyE4k4wZSlpYFkAqSuKxtkCWq8ToxIO3WdgnJ/XIOkQ2QCpJ4avmMnAGOzJcBaa+g95BcLrf7rIBUkNwOYKXcgY7EnwFpp5C3k4y9orO37IBUkPgh4tylMiDZpzC+QzLeMG+ltQJIBYl/uD+6ZAYk7zTO/ptj6fBaA6SCJO5sxUuNfk7yP+UNSD5ADiTZ+tF/rQJSQRJwBCS+DWxAcuBxIYBPkIyj/1pvrQMyk4EkX00MSJMJfWsFxslNnNS17QyQ6mqyfHXgfRx6v2bdYEfQ31+x6hcxDkFdUsERR8p12joFZNbV5DEAdqtgqX1uXKcK5R3MgEyuZ7xHFTd64pz5GyY3y9tzKoDMTkHSVnGMQPUZ+1l6BmTx+Rvnl8T2PKf34azHqQMy66ryRAA7V5/NF9dxkD0MyPxlOw/AaSQv7lNlewNIn0RxLFZgRgED4rlgBRZQwIB4elgBA+I5YAXSFPAVJE03WxWigAEppNBOM00BA5Kmm60KUcCAFFJop5mmgAFJ081WhShgQAoptNNMU8CApOlmq0IUMCCFFNpppilgQNJ0s1UhChiQQgrtNNMUMCBputmqEAUMSCGFdpppChiQNN1sVYgCBqSQQjvNNAUMSJputipEAQNSSKGdZpoCBiRNN1sVooABKaTQTjNNAQOSpputClHAgBRSaKeZpoABSdPNVoUoYEAKKbTTTFPAgKTpZqtCFDAghRTaaaYpYEDSdLNVIQoYkEIK7TTTFDAgabrZqhAFDEghhXaaaQoYkDTdbFWIAgakkEI7zTQFDEiabrYqRAEDUkihnWaaAgYkTTdbFaKAASmk0E4zTQEDkqabrQpRwIAUUminmaaAAUnTzVaFKGBACim000xTwICk6WarQhQwIIUU2mmmKfBf2jGm9n9oLqIAAAAASUVORK5CYII=",f="before",S="loading",I="err";var h=function(){var e=Object(i.useState)(f),t=Object(p.a)(e,2),n=t[0],r=t[1],c=Object(i.useState)(0),o=Object(p.a)(c,2),A=o[0],u=o[1];function d(){return(d=Object(l.a)(s.a.mark((function e(t){var n,a;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t.target.files){e.next=2;break}return e.abrupt("return");case 2:if(n=Array.from(t.target.files),a=n[0],!1!==g(a)){e.next=8;break}return alert("\u8bf7\u4e0a\u4f20mp4/3gp/m3u8\u683c\u5f0f\u7684\u89c6\u9891"),e.abrupt("return");case 8:if(!(a.size>k.maxSize)){e.next=11;break}return alert("\u4e0a\u4f20\u7684\u89c6\u9891\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7200M\uff0c\u8bf7\u538b\u7f29\u540e\u91cd\u65b0\u4e0a\u4f20"),e.abrupt("return");case 11:r("loading"),h(a);case 13:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function g(e){return console.log(e,"----------------------- xxx"),"video/mp4"===e.type||("video/3pg"===e.type||"video/m3u8"===e.type)}function h(e){return x.apply(this,arguments)}function x(){return(x=Object(l.a)(s.a.mark((function e(t){var n,a;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=k.ossClient,a=k.initOSSClient,n){e.next=4;break}return e.next=4,a();case 4:k.ossClient.multipartUpload(k.fileName,t,{parallel:k.parallel,partSize:k.partSize,progress:b}).then((function(e){window.wx.miniProgram.navigateBack(),window.wx.miniProgram.postMessage({data:{returnCode:"SUCCESS",fileName:k.fileName}})})).catch((function(e){r(I)}));case 5:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function N(){return(N=Object(l.a)(s.a.mark((function e(){var t,n;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=k.checkpoints,n=k.ossClient,r(S),Object.values(t).forEach((function(e){var a=e.uploadId,i=e.file;n.multipartUpload(a,i,{parallel:k.parallel,partSize:k.partSize,progress:b,checkpoint:e}).then((function(n){delete t[e.uploadId],window.wx.miniProgram.navigateBack(),window.wx.miniProgram.postMessage({data:{returnCode:"SUCCESS",fileName:k.fileName}})})).catch((function(e){r("err")}))}));case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function b(e,t){return Q.apply(this,arguments)}function Q(){return(Q=Object(l.a)(s.a.mark((function e(t,n){var a;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=100*t,a=Number(a.toFixed(1)),u(a),k.checkpoints[n.uploadId]=n;case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}return Object(i.useEffect)((function(){k.getParams()}),[]),Object(a.jsxs)("div",{className:"page",children:["before"===n&&Object(a.jsxs)("div",{className:"btn",onClick:function(){var e;null===(e=document.getElementById("fileInput"))||void 0===e||e.click()},children:[Object(a.jsx)("img",{src:m,className:"icon",alt:"icon"}),"\u70b9\u51fb\u4e0a\u4f20\u89c6\u9891"]}),"loading"===n&&Object(a.jsxs)("div",{className:"loading",id:"loading",children:[Object(a.jsxs)("div",{className:"progress",children:[Object(a.jsx)("div",{className:"circle loop",children:Object(a.jsx)("div",{className:"dot",id:"dotrunning"})}),Object(a.jsxs)("div",{className:"num",id:"percent",children:[A,"%"]})]}),Object(a.jsx)("div",{className:"info01",children:"\u89c6\u9891\u4e0a\u4f20\u4e2d..."}),Object(a.jsx)("div",{className:"info02",children:"\u4e3a\u786e\u4fdd\u89c6\u9891\u6210\u529f\u4e0a\u4f20\uff0c\u8bf7\u52ff\u79bb\u5f00\u672c\u9875\u54e6\uff01"})]}),"err"===n&&Object(a.jsxs)("div",{className:"btn",onClick:function(){return N.apply(this,arguments)},children:[Object(a.jsx)("img",{src:m,className:"icon",alt:"icon"}),"\u7f51\u7edc\u4e0d\u7a33\u5b9a\uff0c\u70b9\u51fb\u5c1d\u8bd5\u7eed\u4f20"]}),Object(a.jsx)("input",{type:"file",id:"fileInput",accept:"video/mp4,video/3gp,video/m3u8",onChange:function(e){return d.apply(this,arguments)}})]})},x=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,18)).then((function(t){var n=t.getCLS,a=t.getFID,i=t.getFCP,r=t.getLCP,c=t.getTTFB;n(e),a(e),i(e),r(e),c(e)}))};function N(){var e=document.documentElement.clientWidth||document.body.clientWidth;e>750&&(e=750),document.getElementsByTagName("html")[0].style.fontSize=e/375*50+"px"}N(),window.onresize=function(){return N()},o.a.render(Object(a.jsx)(r.a.StrictMode,{children:Object(a.jsx)(h,{})}),document.getElementById("root")),x()}},[[17,1,2]]]);
//# sourceMappingURL=main.7e77f782.chunk.js.map