var recipeCount = 0;
var recipeStart = 0;
var recipeUrl = "";
var recipeSortOrder = "";
var recipeSortMetaName = "";
var recipeGsaCategory = "";
var recipe_gsaCategoryArray = "";
var recipePageType = "";
var recipe_gsaBrand = "";
var layoutType = document.querySelector(".recipesort").getAttribute("layout-type");
var layoutClass = 'col-xs-12 col-sm-6' + ' ' + layoutType + ' ' + 'recipeBox moreBox card-image-width';

if (layoutType == "col-md-6") {
    var recipeNum = parseInt(
        document.querySelector(".initrecipe").getAttribute("data-init"),
        10
    );

    var dataSlide = parseInt(
        document.querySelector(".initrecipe").getAttribute("data-slidedown"),
        10
    );
}
else {
    // for 3 Column design 
    var recipeNum = parseInt(
        document.querySelector(".initrecipe").getAttribute("data-init-3"),
        10
    );

    var dataSlide = parseInt(
        document.querySelector(".initrecipe").getAttribute("data-slidedown-3"),
        10
    );
}

var recipeSortMetaName = document.querySelector(".recipesort").getAttribute("data-sortname");

if (recipeSortMetaName != "") {
    recipeSortOrder = document.querySelector(".recipesort").getAttribute("data-sort");
}

var recipelucidUrl = document.querySelector(".recipeloader").getAttribute("data-url");

function lucidServlet() {
    var meta = document.getElementsByTagName("meta");
    for (var i = 0; i < meta.length; i++) {
        if (meta[i].name == "gsaBrand") {
            recipe_GsaBrand = meta[i].content;
        }
        if (meta[i].name == "gsaPageType") {
            recipePageType = meta[i].content;
        }
    }
    if (recipePageType == "CONSUMER_BRAND") {
        recipeGsaCategory = "filter-gsaBrand=" + encodeURIComponent(recipe_GsaBrand) + "&";
        var redirectElem = document.getElementById('recipe-redirect');
        //If it isn't "undefined" and it isn't "null", then it exists.
        if (typeof (redirectElem) != 'undefined' && redirectElem != null) {
            var hrefAttr = redirectElem.getAttribute('href');
            //Setting redirection for View all Recipes
            var brandHref = hrefAttr + '?q=' + encodeURIComponent(recipe_GsaBrand)+'#Recipes' ; 
            redirectElem.setAttribute('href', brandHref);
        }
    } else {
        for (var i = 0; i < meta.length; i++) {
            if (meta[i].name == "gsaCategory") {
                recipe_gsaCategoryArray = meta[i].content.split(',');
                for (var j = 0; j < recipe_gsaCategoryArray.length; j++) {
                    recipeGsaCategory = recipeGsaCategory + "filter-gsaCategory=" + encodeURIComponent(recipe_gsaCategoryArray[j]) + "&";
                }
                //set view all Recipe redirection for category page
                var redirectElem = document.getElementById('recipe-redirect');
                //If it isn't "undefined" and it isn't "null", then it exists.
                if (typeof (redirectElem) != 'undefined' && redirectElem != null) {
                    var hrefAttr = redirectElem.getAttribute('href');
                    var brandHref = hrefAttr + '?q=' + encodeURIComponent(recipe_gsaCategoryArray[0])+'#Recipes' ; 
                    redirectElem.setAttribute('href', brandHref);
                }
            }
        }
    }
    var recipeRawUrl = lucidServiceCall(recipelucidUrl, query, recipeNum, recipeStart);
    recipeUrl = updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder);
    recipeAjaxCall(recipeUrl, recipeStart, dataSlide, recipeNum);
}
window.onload = lucidServlet;

//for filter
if (document.querySelector("#filter-check") != undefined) {

    /*Change Event Listner for checkbox check*/
    document.querySelector("#filter-check").addEventListener("change", function filterCheck(event) {
        /* ajax call here */
        recipeStart = 0;
        removePreviousResults("recipeloader");
        digitalData.search.searchResults.searchFiltersApplied = filter_gsaCategory.replace(/filter-gsaCourse=/g,"Course:").replace(/filter-gsaOccasion=/g,"Occasion:").replace(/filterRange-gsaTotalTime=/g,"Total Time:").replace(/&/g,"|");;

        var recipeRawUrl = lucidServiceCall(recipelucidUrl, query, recipeNum, recipeStart);
        recipeUrl = updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder);
        recipeAjaxCall(recipeUrl, recipeStart, dataSlide);
    })

    /*Click event listner for listning expand and collapse click*/
    $("#filter-check").on("click keypress", function filterCheck(event) {
        if (event.target.hasAttribute("class") && event.target.classList.contains("filter-minus-span")) {
            /* ajax call here */
            recipeStart = 0;
            removePreviousResults("recipeloader");
            digitalData.search.searchResults.searchFiltersApplied = filter_gsaCategory.replace(/filter-gsaCourse=/g,"Course:").replace(/filter-gsaOccasion=/g,"Occasion:").replace(/filterRange-gsaTotalTime=/g,"Total Time:").replace(/&/g,"|");;
            var recipeRawUrl = lucidServiceCall(recipelucidUrl, query, recipeNum, recipeStart);
            recipeUrl = updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder);
            recipeAjaxCall(recipeUrl, recipeStart, dataSlide);
        }
    })
}



// Search input click event
var input = document.getElementById("searchSubmit");
if (typeof (input) != 'undefined' && input != null) {
    input.addEventListener("click", function (event) {
        if(document.getElementById("search-input").value != ""){
            event.preventDefault();
            searchTextLucid();
        }
    });
}


function searchTextLucid() {
    var query = document.getElementById("search-input").value;
    /* ajax call here */
    recipeStart = 0;
    removePreviousResults("recipeloader");
    var recipeRawUrl = lucidServiceCall(recipelucidUrl, query, recipeNum, recipeStart);
    recipeUrl = updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder);
    recipeAjaxCall(recipeUrl, recipeStart, dataSlide);
}

 if (document.querySelector(".search-results") != undefined) {
  $("#Recipes a").click(function() {
    digitalData.search.searchResults.resultsCount = sessionStorage.getItem("totalResults");
   });
  }


/*Reading json response and appending results */
function readRecipeJSON(obj) {
    /* Reading json from session storage */
    if ((obj["errorMessage"] == "") & (obj["totalResults"] > 0)) {
        recipeTotalResults = obj["totalResults"];
        var resultsElem = document.getElementById('total-results');

        //If it isn't "undefined" and it isn't "null", then it exists.
        if (typeof (resultsElem) != 'undefined' && resultsElem != null) {
            resultsElem.innerHTML = recipeTotalResults;

            if($("#Recipes a").hasClass("active")){
            digitalData.search.searchResults.resultsCount = recipeTotalResults;
            }
        }
        sessionStorage.setItem("totalResults", recipeTotalResults);
        var items = obj["items"];
        var parentDiv = document.querySelector(".recipeloader");
        for (i = 0; i < Object.keys(items).length; i++) {
            var listDiv = document.createElement("div");
            listDiv.setAttribute("class", layoutClass);
            listDiv.setAttribute("style", "");
            var itemDiv = document.createElement("div");
            itemDiv.setAttribute("class", "item active");
            var imgDiv = document.createElement("div");
            imgDiv.setAttribute("class", "recipeBoxImg");
            var a1 = document.createElement("a");
            a1.setAttribute("href", items[i]["url"]);
            a1.setAttribute("tabindex", "0");
            var img = document.createElement("img");
            if (typeof items[i]["metas"]["gsaImage"] != 'undefined') {
                img.setAttribute("src", items[i]["metas"]["gsaImage"]);
            } else {
                img.setAttribute("src", "/content/dam/NorthAmerica/kelloggs/en_US/images/productplaceholder.png");
            }
            img.setAttribute("alt", items[i]["metas"]["gsaPageType"]+"-"+items[i]["metas"]["gsaName"]);
            img.setAttribute("title", items[i]["title"]);
            a1.appendChild(img);
            imgDiv.appendChild(a1);

            itemDiv.appendChild(imgDiv);

            var recipeTextDiv = document.createElement("div");
            recipeTextDiv.setAttribute("class", "recipe-txt txt-black");
            var h3 = document.createElement("h3");
            var a = document.createElement("a");
            a.setAttribute("href", items[i]["url"]);
            if (typeof items[i]["metas"]["gsaName"] != 'undefined') {
                a.innerHTML = items[i]["metas"]["gsaName"];
            } else {
                a.innerHTML = "";
            }
            h3.appendChild(a);
            recipeTextDiv.appendChild(h3);
            var p = document.createElement("p");
            p.setAttribute("class", "recipe-time-servings eyebrow");
            var recipeTimeSpan = document.createElement("span");
            recipeTimeSpan.setAttribute("class", "recipe-time");
            if (typeof items[i]["metas"]["gsaPrepTime"] != 'undefined') {
                recipeTimeSpan.innerHTML = items[i]["metas"]["gsaPrepTime"] + " MIN";
            } else {
                recipeTimeSpan.innerHTML = "";
            }

            if ((typeof items[i]["metas"]["gsaServings"] != 'undefined') && (typeof items[i]["metas"]["gsaPrepTime"] != 'undefined')) {
                var pipeLineSpan = document.createElement("span");
                pipeLineSpan.innerHTML = " | ";
                recipeTimeSpan.appendChild(pipeLineSpan);
            }
            p.appendChild(recipeTimeSpan);
            var recipeTimeServing = document.createElement("span");
            recipeTimeServing.setAttribute("class", "recipe-servings");
            if (typeof items[i]["metas"]["gsaServings"] != 'undefined') {
                var servingsText = "SERVINGS";
                if(items[i]["metas"]["gsaServings"] == 1){
                    servingsText = "SERVING";
            }
                recipeTimeServing.innerHTML = items[i]["metas"]["gsaServings"] + " "+servingsText;
            }
            p.appendChild(recipeTimeServing);
            recipeTextDiv.appendChild(p);
            itemDiv.appendChild(recipeTextDiv);
            listDiv.appendChild(itemDiv);
            parentDiv.appendChild(listDiv);

            if (obj["totalResults"] <= recipeNum) {
                document.querySelector(".recipeloadmore").style.display = "none";
                recipeStart = 0;
            } else {
                document.querySelector(".recipeloadmore").style.display = "block";
            }
        }
    } else if (obj["totalResults"] == 0) {
        var resultsElem = document.getElementById('total-results');
        //If it isn't "undefined" and it isn't "null", then it exists.
        if (typeof (resultsElem) != 'undefined' && resultsElem != null) {
            resultsElem.innerHTML = obj["totalResults"];
             digitalData.search.searchResults.resultsCount = "0";
        }
        console.log("No results found");
        var parentDiv = document.querySelector(".recipeloader");
        var listDiv = document.createElement("div");
        listDiv.setAttribute("class", layoutClass);
        var h3 = document.createElement("h3");
        h3.innerHTML = "No Results Found";
        h3.setAttribute("tabindex", "7");
        listDiv.appendChild(h3);
        parentDiv.appendChild(listDiv);
        document.querySelector(".recipeloadmore").style.display = "none";
    }
}
/* Event listener for load more */
$('.initrecipe').on("click keypress", function ()  {

    var recipelucidUrl = document.querySelector(".recipeloader").getAttribute("data-url");
    if (recipeCount == 0) {
        recipeStart = recipeStart + recipeNum;
        recipeCount++;
    } else {
        recipeStart = recipeStart + dataSlide;
        recipeCount++;
    }

    var recipeRawUrl = lucidServiceCall(recipelucidUrl, query, dataSlide, recipeStart);
    recipeUrl = updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder);
    recipeAjaxCall(recipeUrl, recipeStart, dataSlide);
});

function recipeAjaxCall(recipeListUrl, recipeStart, dataSlide, initItems) {
    $.ajax({
        url: recipeUrl,
        type: "GET",
        dataType: "jsonp"
    }).done(function (obj) {
        console.log("success :", obj);
        /*read json method call here*/
        readRecipeJSON(obj);
        if (typeof initItems !== "undefined") {
            dataSlide = initItems;
        }

        if (recipeStart >= ((obj["totalResults"]) - dataSlide)) {
            document.querySelector(".recipeloadmore").style.display = "none";
            recipeCount = 0;
        }
        recipeUrl = "";
    }).fail(function (j, l, k) {
        console.log("request:");
        console.log(j);
        console.log("status: ");
        console.log(l);
        console.log("error: ");
        console.log(k);
        document.querySelector(".recipeloadmore").style.display = "none";
    });

}

function updateRecipeRawUrl(recipeRawUrl, recipeSortMetaName, recipeSortOrder) {
    if (typeof filter_gsaCategory !== "undefined" && filter_gsaCategory != "") {
        return recipeRawUrl + filter_gsaCategory + "sortmetaname=" + recipeSortMetaName + "&" + "sortmetaorder=" + recipeSortOrder;
    } else if (recipeGsaCategory != "") {
        return recipeRawUrl + recipeGsaCategory + "sortmetaname=" + recipeSortMetaName + "&" + "sortmetaorder=" + recipeSortOrder;
    } else {
        return recipeRawUrl + "sortmetaname=" + recipeSortMetaName + "&" + "sortmetaorder=" + recipeSortOrder;
    }
}
