// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon: true,
    // Enable templates auto precompilation
    precompileTemplates: true,
    // Enabled pages rendering using Template7
    swipeBackPage: false,
    swipeBackPageThreshold: 1,
    swipePanel: 'left',
    swipePanelCloseOpposite: true,
    pushState: true,
    pushStateRoot: undefined,
    pushStateNoAnimation: false,
    pushStateSeparator: '#!/',
    template7Pages: true,
    tapHold: true, //enable tap hold events
    tapHoldPreventClicks:false,
    preprocess: function (content, url, next) {
        var onlyurl = url.split('?')[0];
        if (onlyurl === 'menu.html') {
            var compiledDashBoardTemplate = Template7.compile(content);
            var html = compiledDashBoardTemplate(userLoggedIn);
            return html;
        }
        else {
            return content;
        }
    },
    preroute: function (view, options) {
        if (view.activePage.name === 'index') {
            if (!userLoggedIn) {
                return false; //required to prevent default router action
            }
        }
        else if (!userLoggedIn) {
            //show session exipry msg and reauthenticate user..
        }
    }
});

// Export selectors engine
var $$ = Dom7;

var serviceLinks = {
    //TktService:'http://192.169.138.161/~jrs1/srpservices.php'  //JRS server
    TktService:'http://166.62.126.161/srpservices.php'//SRP Service
};


// Add main View
var mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: false
});

var DashBorad = '';
var userLoggedIn = '';

$$(document).on('ajaxStart',function(e){myApp.showIndicator();});
$$(document).on('ajaxComplete', function () { myApp.hideIndicator(); });

//for initail load
parseUserInfoData(RetreiveData(true));

//open panel
myApp.openPanel('left');

//bind events
bindEvents(bindings);

//on init
$$(document).on('pageInit', function (e) {

    var page = e.detail.page;

    //user log out
    if (page.name === 'index') {
        if (e.detail.page.context.Logout) {
            LogOut();
        }
        else if (e.detail.page.context.dashboard) {
            if (!DashBorad) {
                DashBorad = new dashboard();
                DashBorad.getDashBoardItems();
            }
            else {
                DashBorad.updateDashBoardItems();
            }
        }
    }

    if (page.name === 'TicketSale') {
        ticketsale.init();
    }
    if (page.name === 'result') {
        TktPrizeResult = new result();
        TktPrizeResult.initCalender();
        TktPrizeResult.GetResult();
    }

    if (page.name === 'todayswinner') {
        dailywinner = new dailyWinner();
        dailywinner.initCalender();
        dailywinner.GetWinners();
    }
    if (page.name === 'SalesCommision') {
        salescomm = new SalesCommision();
        salescomm.initCalender();
        salescomm.GetSalesCommision();
    }
    if (page.name === 'PrizeCommision') {
        prizecomm = new PrizeCommision();
        prizecomm.initCalender();
        prizecomm.GetPrizeCommision();
    }
    if (page.name === 'dailysale') {
        dailysales = new DailySales();
        dailysales.initCalender();
        dailysales.GetDailySales();
    }
    if (page.name === 'incomeSummary') {
        income = new incomeSummary();
        income.initCalender();
        income.GetIncomeSummary();
    }
    if (page.name === 'resultEntry') {
        resultentry = new resultEntry();
        resultentry.initCalender();
        resultentry.GetResults();
    }
    if (page.name === 'agentPayment') {
        agentpayment = new agentPayment();
        agentpayment.initCalender();
        agentpayment.getPaymentList();
    }
    $(".swipebox").swipebox();

    $('a.backbutton').click(function () {
        parent.history.back();
        return false;
    });


    $(".posts li").hide();
    size_li = $(".posts li").size();
    x = 4;
    $('.posts li:lt(' + x + ')').show();
    $('#loadMore').click(function () {
        x = (x + 1 <= size_li) ? x + 1 : size_li;
        $('.posts li:lt(' + x + ')').show();
        if (x == size_li) {
            $('#loadMore').hide();
            $('#showLess').show();
        }
    });


    $("a.switcher").bind("click", function (e) {
        e.preventDefault();

        var theid = $(this).attr("id");
        var theproducts = $("ul#photoslist");
        var classNames = $(this).attr('class').split(' ');


        if ($(this).hasClass("active")) {
            // if currently clicked button has the active class
            // then we do nothing!
            return false;
        } else {
            // otherwise we are clicking on the inactive button
            // and in the process of switching views!
            if (theid == "RefreshUserList") {
                userlist.ReLoadUsers();
            }
            if (theid == "view13") {
                $(this).addClass("active");
                $("#view11").removeClass("active");
                $("#view11").children("img").attr("src", "images/switch_11.png");

                $("#view12").removeClass("active");
                $("#view12").children("img").attr("src", "images/switch_12.png");

                var theimg = $(this).children("img");
                theimg.attr("src", "images/switch_13_active.png");

                // remove the list class and change to grid
                theproducts.removeClass("photo_gallery_11");
                theproducts.removeClass("photo_gallery_12");
                theproducts.addClass("photo_gallery_13");

            }

            else if (theid == "view12") {
                $(this).addClass("active");
                $("#view11").removeClass("active");
                $("#view11").children("img").attr("src", "images/switch_11.png");

                $("#view13").removeClass("active");
                $("#view13").children("img").attr("src", "images/switch_13.png");

                var theimg = $(this).children("img");
                theimg.attr("src", "images/switch_12_active.png");

                // remove the list class and change to grid
                theproducts.removeClass("photo_gallery_11");
                theproducts.removeClass("photo_gallery_13");
                theproducts.addClass("photo_gallery_12");

            }
            else if (theid == "view11") {
                $("#view12").removeClass("active");
                $("#view12").children("img").attr("src", "images/switch_12.png");

                $("#view13").removeClass("active");
                $("#view13").children("img").attr("src", "images/switch_13.png");

                var theimg = $(this).children("img");
                theimg.attr("src", "images/switch_11_active.png");

                // remove the list class and change to grid
                theproducts.removeClass("photo_gallery_12");
                theproducts.removeClass("photo_gallery_13");
                theproducts.addClass("photo_gallery_11");

            }

        }

    });


})

myApp.onPageInit('autocomplete', function (page) {
var fruits = ('Apple Apricot Avocado Banana Melon Orange Peach Pear Pineapple').split(' ');
var autocompleteDropdownSimple = myApp.autocomplete({
    input: '#autocomplete-dropdown',
    openIn: 'dropdown',
    source: function (autocomplete, query, render) {
        var results = [];
        if (query.length === 0) {
            render(results);
            return;
        }
        // Find matched items
        for (var i = 0; i < fruits.length; i++) {
            if (fruits[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(fruits[i]);
        }
        // Render items by passing array with result items
        render(results);
    }
});
});

