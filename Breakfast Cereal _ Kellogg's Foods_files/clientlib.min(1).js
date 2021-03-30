var count=0;
var productUrl="";
var productstart=0;
var sortProductMetaName=document.querySelector(".allProducts").getAttribute("data-sortname");
var sortProductMetaOrder="";
var productnum=parseInt(document.querySelector(".product-results").getAttribute("data-num"),10);
if(sortProductMetaName!=""){sortProductMetaOrder=document.querySelector(".allProducts").getAttribute("data-sortorder")
}var productnumtoLoad=2;
if($(window).width()>575){productnumtoLoad=3
}if($(window).width()<575){productnum=2
}var product_gsaCategory="";
var product_gsaCategoryArray="";
var product_gsacategoryforviewall="";
var page_type="";
var product_gsaBrand="";
var viewallhref=$("#productviewallcta").attr("href");
var productlucidUrl=document.querySelector(".product-results-list").getAttribute("data-url");
var meta=document.getElementsByTagName("meta");
for(var i=0;
i<meta.length;
i++){if(meta[i].name=="gsaBrand"){product_gsaBrand=meta[i].content
}if(meta[i].name=="gsaPageType"){page_type=meta[i].content
}}if(page_type=="CONSUMER_BRAND"){product_gsaCategoryArray=product_gsaBrand.split(",");
for(var j=0;
j<product_gsaCategoryArray.length;
j++){product_gsaCategory=product_gsaCategory+"filter-gsaBrand="+encodeURIComponent(product_gsaCategoryArray[j])+"&"
}$("#productviewallcta").attr("href",viewallhref+"?q="+encodeURIComponent(product_gsaBrand)+"#Foods")
}else{for(var i=0;
i<meta.length;
i++){if(meta[i].name=="gsaCategory"){product_gsaCategoryArray=meta[i].content.split(",");
product_gsacategoryforviewall=meta[i].content;
for(var j=0;
j<product_gsaCategoryArray.length;
j++){product_gsaCategory=product_gsaCategory+"filter-gsaCategory="+encodeURIComponent(product_gsaCategoryArray[j])+"&"
}$("#productviewallcta").attr("href",viewallhref+"?q="+encodeURIComponent(product_gsacategoryforviewall)+"#Foods")
}}}document.addEventListener("DOMContentLoaded",function domchange(b){var a=lucidServiceCall(productlucidUrl,"",productnum,productstart);
productUrl=updateproductRawUrl(a,sortProductMetaName,sortProductMetaOrder);
ProductajaxCall(productUrl);
console.log("Product Ajax call done")
});
if(document.querySelector("#filter-check")!=undefined){document.querySelector("#filter-check").addEventListener("change",function filterCheck(c){var b=0;
removePreviousResults("product-results-list");
var a=lucidServiceCall(productlucidUrl,"",productnum,b);
productUrl=updateproductRawUrl(a,sortProductMetaName,sortProductMetaOrder);
ProductajaxCall(productUrl);
console.log("Product Ajax call done")
});
$("#filter-check").on("click keypress",function filterCheck(c){if(c.target.hasAttribute("class")&&c.target.classList.contains("filter-minus-span")){var b=0;
removePreviousResults("product-results-list");
var a=lucidServiceCall(productlucidUrl,"",productnum,b);
productUrl=updateproductRawUrl(a,sortProductMetaName,sortProductMetaOrder);
ProductajaxCall(productUrl);
console.log("Product Ajax call done")
}})
}function readProductJSON(h){var d="";
if((h.errorMessage=="")&(h.totalResults>0)){totalResults=h.totalResults;
sessionStorage.setItem("totalResults",totalResults);
var p=h.items;
for(i=0;
i<Object.keys(p).length;
i++){var b=document.querySelector(".product-results-list");
var f=document.createElement("li");
f.setAttribute("class","product-results-item moreBox");
var k=document.createElement("div");
k.setAttribute("class","brandIcon");
f.appendChild(k);
b.appendChild(f);
var e=document.createElement("a");
e.setAttribute("href",p[i]["url"]);
var s=document.createElement("img");
if(typeof p[i]["metas"]["gsaImage"]!="undefined"){s.setAttribute("src",p[i]["metas"]["gsaImage"])
}else{s.setAttribute("src","/content/dam/NorthAmerica/kelloggs/en_US/images/productplaceholder.png")
}if(typeof p[i]["metas"]["gsaName"]!="undefined"){s.setAttribute("alt",p[i]["metas"]["gsaName"]+"-"+p[i]["metas"]["gsaName"]);
s.setAttribute("title",p[i]["title"])
}s.setAttribute("class","img-fitContent");
s.setAttribute("onerror","this.onerror=null;this.src='/content/dam/NorthAmerica/kelloggs/en_US/images/productplaceholder.png';");
e.appendChild(s);
k.appendChild(e);
var r=document.createElement("span");
r.setAttribute("class","brandHeading P1-txt");
var l=document.createElement("a");
l.setAttribute("href",p[i]["url"]);
l.setAttribute("tabindex","0");
if(typeof p[i]["metas"]["gsaName"]!="undefined"){l.innerHTML=p[i]["metas"]["gsaName"];
l.setAttribute("title",l.innerHTML)
}r.appendChild(l);
var c=document.createElement("div");
c.setAttribute("class","brd-rating");
if((p[i]["metas"]["gsaRrEnabled"]=="Yes")||(p[i]["metas"]["gsaRrEnabled"]=="yes")){var a=document.createElement("div");
a.setAttribute("data-bv-show","inline_rating");
a.setAttribute("data-bv-product-id",p[i]["metas"]["gsaProductID"]);
var q=p[i]["url"];
a.setAttribute("data-bv-redirect-url",q.replace("/content/NorthAmerica/kelloggs/en_US/pages/products/","/en_US/products/"));
c.appendChild(a)
}var o=document.createElement("span");
o.setAttribute("class","brandHeading cta_primary");
var g=document.createElement("a");
g.setAttribute("href",p[i]["url"]);
g.setAttribute("aria-label","View Product "+p[i]["metas"]["gsaName"]);
g.innerHTML=document.querySelector(".allProducts").getAttribute("data-cta-text");
o.appendChild(g);
var m="";
if(document.querySelector(".allProducts")){var m=document.querySelector(".allProducts").getAttribute("data-display")
}f.appendChild(r);
f.appendChild(c);
f.appendChild(o)
}if(h.totalResults<=productnum||productstart>=(totalResults-productnumtoLoad)){document.querySelector(".product-loadmore").style.display="none";
document.querySelector(".productinit").style.display="none";
productstart=0
}else{document.querySelector(".product-loadmore").style.display="block";
document.querySelector(".productinit").style.display="block"
}}else{if(h.totalResults==0){var n="No results found ";
var b=document.querySelector(".product-results-list");
var f=document.createElement("li");
f.setAttribute("class","no-results");
var k=document.createElement("h3");
k.innerHTML=n;
f.appendChild(k);
b.appendChild(f);
document.querySelector(".product-loadmore").style.display="none";
document.querySelector(".productinit").style.display="none"
}}}function ProductajaxCall(a){$.ajax({url:productUrl,type:"GET",dataType:"jsonp"}).done(function(b){console.log("success :",b);
readProductJSON(b);
productUrl=""
}).fail(function(d,b,c){console.log("request:");
console.log(d);
console.log("status: ");
console.log(b);
console.log("error: ");
console.log(c)
})
}function updateproductRawUrl(c,a,b){if(typeof filter_gsaCategory!=="undefined"&&filter_gsaCategory!=""){return c+filter_gsaCategory+"sortmetaname="+a+"&sortmetaorder="+b
}else{if(product_gsaCategory!=""){return c+product_gsaCategory+"sortmetaname="+a+"&sortmetaorder="+b
}else{return c+"sortmetaname="+a+"&sortmetaorder="+b
}}}$(".product-loadmore").on("click keypress",function(b){if(count==0){productstart=productstart+productnum;
count++
}else{productstart=productstart+productnumtoLoad;
count++
}var a=lucidServiceCall(productlucidUrl,query,productnumtoLoad,productstart);
productUrl=updateproductRawUrl(a,sortProductMetaName,sortProductMetaOrder);
$.ajax({url:productUrl,type:"GET",dataType:"jsonp"}).done(function(c){console.log("success :",c);
readProductJSON(c)
}).fail(function(e,c,d){console.log("request:");
console.log(e);
console.log("status: ");
console.log(c);
console.log("error: ");
console.log(d)
});
if(productstart>=(totalResults-productnumtoLoad)){document.querySelector(".product-loadmore").style.display="none";
document.querySelector(".productinit").style.display="none";
count=0
}});