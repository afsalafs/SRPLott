ticketsale = {
    Category_All: [
    { key: "0", textsub: 'A', categoryid: 5, tktcost: 12, salesCommision: 1, priceCommision: 0, show: true, default_select: true },
    { key: "1", textsub: 'B', categoryid: 5, tktcost: 12, salesCommision: 1, priceCommision: 0, show: true, default_select: false },
    { key: "2", textsub: 'C', categoryid: 5, tktcost: 12, salesCommision: 1, priceCommision: 0, show: true, default_select: false },
    { key: "3", textsub: 'AB', categoryid: 6, tktcost: 10, salesCommision: 1, priceCommision: 0, show: true, default_select: true },
    { key: "4", textsub: 'AC', categoryid: 6, tktcost: 10, salesCommision: 1, priceCommision: 0, show: true, default_select: false },
    { key: "5", textsub: 'BC', categoryid: 6, tktcost: 10, salesCommision: 1, priceCommision: 0, show: true, default_select: false },
    { key: "6", text: 'LSK', categoryid: 1, tktcost: 10, salesCommision: 1.5, priceCommision: 400, show: true, default_select: true },
    { key: "7", text: 'BOX', categoryid: 2, tktcost: 10, salesCommision: 1.5, priceCommision: 30, show: true, default_select: false },
    { key: "8", text: 'BOX', categoryid: 3, tktcost: 10, salesCommision: 1.5, priceCommision: 60 },
    { key: "9", text: 'BOX', categoryid: 4, tktcost: 10, salesCommision: 1.5, priceCommision: 60 },
    { key: "6,7", text: 'ALL', show: true, default_select: false}],
    init: function init() {
        //Notify cutofftime 
        //this.GetCutOffTime();
        //initialize virtual list for displaying currently selected tkt no's
        this.TicketNumbers_ListView = myApp.virtualList('#tktsale-list', {
            items: ticketsale.TicketNumbers_Selected,
            template: Template7.templates.TicketListView,
            // search all items, we need to return array with indexes of matched items
            searchAll: function (query, items) {
                var foundItems = [];
                for (var i = 0; i < items.length; i++) {
                    // Check if title contains query string
                    if (items[i].ticketnumber.indexOf(query.trim()) >= 0) foundItems.push(i);
                }
                // Return array with indexes of matched items
                return foundItems;
            }
        });
        //set user_id
        this.userID = userLoggedIn.user_id;
        //getspecial prizes
        this.GetSpecialprizes();
        //current sale summary
        $$('.CurrentSale_Popover').on('click', function () {
            ticketsale.CurrentSale_Popover(this);
        });
        //post currently selected tkts sales to server
        $$('.CurrentSale_PostToServer').on('click', function () {
            ticketsale.PostTktsToServer(); //happly go to home.'.
        });
        //action popup launcher normal window with out VKB
        $$('#Launcher_Action_Popup').on('click', function () {
            ticketsale.Launch_Action_Popup(); //new Ticket Sale action window 
        });
        //action popup launcher normal window with VKB toggle
        $$('#Launcher_Action_Popup_VKB').on('click', function () {
            $$('#TktEntryWindow').toggleClass('hideTktentryform') //toggle visibility of Ticket Sale action window 
        });
        //delete selected tkts
        $$('#Delete_selectedTkt').on('click', function () {
            ticketsale.TicketNumbers_ListView.deleteAllItems(); //delete all.
            ticketsale.TicketNumbers_Selected = ticketsale.TicketNumbers_ListView.items; //reset the source array to empty,keep the reference of the source arrray as same
            ticketsale.resetBatchSeq(0);//reset batch no seq to 0
        });
        //Debugger hide..
        $$('input#debugmsg').hide();

        //using virtual keyboard,start tkt entry window on load..
        ticketsale.Launch_Action_Popup(false, true); //new Ticket Sale action window using virtual kb
        //hide status bar
        ticketsale.ButtonCancel();
    },
    Launch_Action_Popup: function (update, vkb) {
        ticketsale.Set_Current_Category_Display();
        if (update) {//if Ticket Sale action window already created then update the tkt category based on selected group..
            $$('#TktCategory').html(Template7.templates.TicketCategoryTemplate(ticketsale))
        }
        else { //------here we start launch new Ticket Sale action window---------//   
            var popupHTML = vkb ? Template7.templates.TicketSelectionTemplateVKB(ticketsale) : Template7.templates.TicketSelectionTemplate(ticketsale);
            //if u want the tkt entry window as a popup then..
            //myApp.popup(popupHTML);
            //else
            $$('#TktEntryWindow').html(popupHTML);
            $$('#butOK').on('click', function () {
                ticketsale.ButtonOK();
            });
            TktNumberSwiper = myApp.swiper('.swiper-container', {
                speed: 400,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                onSlideChangeStart: function (swiper) { ticketsale.SwitchClick(swiper); },
                onTransitionEnd: function (swiper) {
                    ticketsale.Set_Focus();
                }
            });
            $('#TktGroup').find('a').off('click').click(function () {
                ticketsale.Current_Category_Filter = eval($$(this).data('CategoryIndex'));
                ticketsale.Launch_Action_Popup(true); //update the existing Ticket Sale action window.
            });
            ticketsale.input_TicketSale = $$('input[data-key="TicketSale"]');
            $.each(ticketsale.input_TicketSale, function (index, element) {
                $(element).on('keyup keydown change', function (e) {
                    var theEvent = e || window.event;
                    var iKeyCode = theEvent.keyCode || theEvent.which;
                    return ticketsale.OnCtrlKeyPress(e.target, iKeyCode);
                });
                $(element).on('click', function (e) {
                    ticketsale.currentfocusCtrl = e.target;
                    ticketsale.SetRedBorderFocusCtrl();
                });
            });
        }
        //-------here ends the tkts sale actin window----------//
        //claer inputs
        ticketsale.ClearInputFields();
        ticketsale.currentfocusCtrl = '';
        //set length of  ticketsale inputs[TktNoSingle,,] based on selected group..
        $.each(ticketsale.input_TicketSale, function (index, element) {
            var strMatches = element.id.match(/TktNo/g);
            if (strMatches && strMatches.length > 0) {
                var maxlength = (ticketsale.Current_Category_Selected[0].textsub || ticketsale.Current_Category_Selected[0].text).length;
                var appendValue = '';
                for (var i = 0; i < maxlength; i++) {
                    appendValue += '9';
                }
                //element.max = appendValue;
                $$(element).attr('max', appendValue);
            }
        });
    },
    currentfocusCtrl: '',
    SetNumber: function (number) {
        if (!ticketsale.currentfocusCtrl) { ticketsale.Set_Focus(); }
        if (ticketsale.currentfocusCtrl.value.length < ticketsale.currentfocusCtrl.max.length) {
            ticketsale.currentfocusCtrl.value += number;
        }
        ticketsale.OnCtrlKeyPress(ticketsale.currentfocusCtrl, '');
    },
    SetAction: function (action) {
        switch (action) {
            case '<':
                ticketsale.currentfocusCtrl.value = ticketsale.currentfocusCtrl.value.slice(0, -1);
                break;
            case 'clr':
                ticketsale.ClearInputFields();
                ticketsale.Set_Focus(); //reset focus to first tab index..
                break;
            case 'tab':
                if (!ticketsale.currentfocusCtrl) { ticketsale.Set_Focus(); }
                else
                    ticketsale.GoToNextCtrl();
                ticketsale.SetRedBorderFocusCtrl();
                break;
        }
    },
    OnCtrlKeyPress: function (ctrl, iKeyCode) {
        if (iKeyCode != 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57)) {
            return false;
        }
        else if (iKeyCode == 13) {
            return false
        }
        var txtval = ctrl.value.replace(/[^0-9]/g, '');
        if (txtval != "") {
            switch (ctrl.id) {
                case "TktNoSingle":
                    ticketsale.SetTktNumberSingle(txtval);
                    break;
                case "TktNoMultipleStart":
                    ticketsale.SetTktNumberMultipleStart(txtval);
                    break;
                case "TktNoMultipleStep":
                    ticketsale.SetTktNumberMultipleStep(txtval);
                    break;
                case "TktNoMultipleEnd":
                    ticketsale.SetTktNumberMultipleEnd(txtval);
                    break;
                case "TktCount":
                    ticketsale.SetTktCount(txtval);
                    break;
            }
        }
        if (iKeyCode != 9 && iKeyCode != 8)
            if (ctrl.value.length >= ctrl.max.length) {
                ticketsale.GoToNextCtrl(ctrl);
                ticketsale.SetRedBorderFocusCtrl();
                return false;
            }
    },
    GoToNextCtrl: function (current_ctrl) {
        ctrl = current_ctrl ? current_ctrl : ticketsale.currentfocusCtrl;
        var tabIndex = (ctrl.tabIndex + 1);
        if (tabIndex > ticketsale.MaxtabIndex) tabIndex = 0;
        $.each(ticketsale.input_TicketSale, function (index, item) {
            if (item.tabIndex == tabIndex) {
                ticketsale.currentfocusCtrl = item;
            }
        });
        ticketsale.currentfocusCtrl.focus();
    },
    SetRedBorderFocusCtrl: function () {
        $.each(ticketsale.input_TicketSale, function (index, item) {
            if (item == ticketsale.currentfocusCtrl) {
                $(item).css({ "border": "1px solid red" });
            }
            else {
                $(item).css({ "border": "none" });
            }
        });
    },
    ClearInputFields: function () {
        $.each(ticketsale.input_TicketSale, function (index, element) {
            $$(element).val('');
        });
        ticketsale.TktNumber.Start = ticketsale.TktNumber.End = '';
        ticketsale.TktNumber.Step = 1;
        ticketsale.TktCount = '';
    },
    Set_Focus: function () {
        for (var i = 0; i < ticketsale.input_TicketSale.length; i++) {
            if (ticketsale.input_TicketSale[i].tabIndex == 0) {
                ticketsale.currentfocusCtrl = ticketsale.input_TicketSale[i];
                ticketsale.currentfocusCtrl.focus();
                ticketsale.SetRedBorderFocusCtrl();
                break;
            }
        };
    },
    Set_Current_Category_Display: function () {
        ticketsale.Current_Category_Display = [];
        $.each(ticketsale.Current_Category_Filter, function (index, value) {
            ticketsale.Current_Category_Display.push(ticketsale.Category_All[value]);
        });
        ticketsale.SelectTktCategory(ticketsale.Current_Category_Display[0].key);
    },
    input_TicketSale: [],
    TicketNumbers_Selected: [],
    TicketNumbers_ListView: {},
    SwitchClick: function (swiper) {
        if (swiper.activeIndex == 1) {//multiple
            TktNumberSwiper.slideNext();
            ticketsale.input_TicketSale[0].tabIndex = -1;
            ticketsale.input_TicketSale[1].tabIndex = 0;
            ticketsale.input_TicketSale[2].tabIndex = 1;
            ticketsale.input_TicketSale[3].tabIndex = 2;
            ticketsale.input_TicketSale[4].tabIndex = 3;
            ticketsale.MaxtabIndex = 3;
        }
        else {//single
            TktNumberSwiper.slidePrev();
            ticketsale.input_TicketSale[0].tabIndex = 0;
            ticketsale.input_TicketSale[1].tabIndex = -1;
            ticketsale.input_TicketSale[2].tabIndex = -1;
            ticketsale.input_TicketSale[3].tabIndex = -1;
            ticketsale.input_TicketSale[4].tabIndex = 1;
            ticketsale.MaxtabIndex = 1;
        }
        ticketsale.TktNumber.Single_Mutiple_Flag = swiper.activeIndex == 1;
    },
    ButtonOK: function () {
        if (ticketsale.TktNumber.Start === "" || ticketsale.TktNumber.End === "")
        { myApp.alert('Please enter Ticket Number', 'Ticket Sale'); return; }
        if (ticketsale.TktCount === "")
        { myApp.alert('Please enter Ticket Quantity', 'Ticket Sale'); return; }
        if (ticketsale.TktNumber.Step <= 0)
        { myApp.alert('The step value should be greater than 0', 'Ticket Sale'); return; }
        var RcrdsRemainig = ticketsale.MaxRcrdsAtaTime - ticketsale.TicketNumbers_ListView.items.length;
        var rcrdsCount = 0;
        for (var TktNo = parseInt(ticketsale.TktNumber.Start); TktNo <= parseInt(ticketsale.TktNumber.End); TktNo = TktNo + ticketsale.TktNumber.Step) { rcrdsCount++; }
        if (rcrdsCount > RcrdsRemainig)
        { myApp.alert('Only ' + ticketsale.MaxRcrdsAtaTime + ' entries allowed At a time\n Remaining entries ' + RcrdsRemainig, 'Ticket Sale'); return; }
        var tktNoValidLength = (ticketsale.Current_Category_Selected[0].textsub || ticketsale.Current_Category_Selected[0].text).length;
        if (tktNoValidLength != ticketsale.TktNumber.Start.length || tktNoValidLength != ticketsale.TktNumber.End.length)
        { myApp.alert('For the Selected Ticket Category Ticket Number should be \n' + tktNoValidLength + ' digit(s)', 'Ticket Sale'); return; }
        var pad = "";
        for (var i = 0; i < tktNoValidLength; i++) pad += 0;
        //after required validation
        for (var TktNo = parseInt(ticketsale.TktNumber.Start); TktNo <= parseInt(ticketsale.TktNumber.End); TktNo = TktNo + ticketsale.TktNumber.Step) {
            $.each(ticketsale.Current_Category_Selected, function (index, value) {
                var ticketNo = new TicketModel(
                { "ticketnumber": pad.substring(0, pad.length - ("" + TktNo).length) + TktNo,
                    "categoryid": value.categoryid,
                    "catgname": value.textsub,
                    "quantity": ticketsale.TktCount,
                    "agentid": ticketsale.userID,
                    "ticket_cost": value.tktcost,
                    "sales_commission": ticketsale.Get_salesCommision(value),
                    "prize_commission": value.priceCommision
                });
                ticketNo.UpdateBoxCategoryDetailsByTktNoFormat();
                ticketNo.CalculateTotalamt();
                ticketsale.TicketNumbers_ListView.appendItem(ticketNo);
            });
        }
        ticketsale.TicketNumbers_ListView.scrollToItem(ticketsale.TicketNumbers_ListView.currentToIndex);
        ticketsale.ClearInputFields();
        ticketsale.Set_Focus();
    },
    Get_salesCommision: function (tktCategory) {
        var salescomm = tktCategory.salesCommision;
        if (tktCategory.specialprize) {
            var result = $.grep(tktCategory.specialprize, function (e) {
                return e[ticketsale.userID] ? true : false;
            });
            if (result.length == 1) {
                salescomm = parseFloat(result[0][ticketsale.userID]);
            }
        }
        return salescomm;
    },
    ButtonCancel: function () {
        try {
            StatusBar.hide();
        } catch (e) {

        }
    },
    CategoryradioClick: function (radio) {
        ticketsale.SelectTktCategory($$(radio).data('key'));
        $$('a.active').removeClass('active')
        $$(radio).toggleClass('active');
        ticketsale.ButtonOK();
    },
    SelectTktCategory: function (keys) {
        keys = keys.split(',');
        if (keys.length > 0) {
            ticketsale.Current_Category_Selected = [];
            $.each(keys, function (index, value) {
                ticketsale.Current_Category_Selected.push(ticketsale.Category_All[value]);
            });
        }
    },
    GetIndexByTktEntryID: function (entryID) {
        var entryIndex;
        if (ticketsale.TicketNumbers_Selected.length > 0) {
            for (var i = 0; i < ticketsale.TicketNumbers_Selected.length; i++) {
                if (ticketsale.TicketNumbers_Selected[i].entryid === entryID) {
                    entryIndex = i;
                    break;
                }
            }
        }
        return entryIndex;
    },
    GetSpecialprizes: function () {
        var postdata = { action_sub: 'GetSpecialprize', agentid: ticketsale.userID };
        $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
            try {
                var dat = ParseJsonString(data);
                if (dat && dat.length > 0) {
                    for (var s = 0; s < ticketsale.Category_All.length; s++) {
                        if (dat[0][ticketsale.Category_All[s].categoryid]) {
                            ticketsale.Category_All[s].specialprize = eval("[{" + ticketsale.userID + " : " + dat[0][ticketsale.Category_All[s].categoryid] + "}]");
                        }
                    }
                }
            } catch (err) {
                console.log(err.message)
            }
            //console.log(data);
        }, function (xhr, status) {
            console.log(xhr.responseText);
        });
    },
    GetCutOffTime: function () {
        $$.post(serviceLinks.TktService, 'action_sub=GetCutOfTime', function (data) {
            try {
                var cutOffTime = JSON.parse(data);
                if (cutOffTime.Result) {
                    if (cutOffTime.Message) {
                        myApp.addNotification({
                            title: 'Ticket Sale CutOffTime',
                            message: cutOffTime.Message
                        });
                    }
                }
                else {
                    var timetowait = cutOffTime.Message.replace(/\D+/g, '');
                    if (parseInt(timetowait) > 0)
                        myApp.addNotification({
                            title: 'Ticket Sale CutOffTime',
                            message: cutOffTime.Message,
                            additionalClass: 'notifications-customHeight',
                            hold: (parseInt(timetowait) * 60 * 1000),
                            onClose: function () {
                                myApp.closeModal();
                                mainView.router.back('');
                            }
                        });
                }
            } catch (err) {
                console.log(err.message)
            }
            //console.log(data);
        }, function (xhr, status) {
            console.log(xhr.responseText);
        });
        myApp.hideIndicator();
    },
    SetTktNumberSingle: function (txt) {
        //after require valdatin
        ticketsale.TktNumber.Start = ticketsale.TktNumber.End = txt;
        ticketsale.TktNumber.Step = 1;
    },
    SetTktNumberMultipleStart: function (txt) {
        //after require valdatin
        ticketsale.TktNumber.Start = txt;

    },
    SetTktNumberMultipleEnd: function (txt) {
        //after require valdatin
        ticketsale.TktNumber.End = txt;

    },
    SetTktNumberMultipleStep: function (txt) {
        //after require valdatin
        ticketsale.TktNumber.Step = parseInt(txt);
    },
    SetTktCount: function (txt) {
        //after require valdatin
        ticketsale.TktCount = parseInt(txt);
    },
    resetBatchSeq: function (val) {
        ticketsale.TktBatchSeq = val;
    },
    Current_Category_Display: [],
    Current_Category_Filter: [6, 7, 8, 9, 10], //default tkt categories
    Current_Category_Selected: [],
    TktNumber: {
        Single_Mutiple_Flag: false,
        Start: '',
        End: '',
        Step: 1
    },
    TktBatchSeq: 0,
    MaxtabIndex: 1,
    TktCount: '',
    userID: '',
    MaxRcrdsAtaTime: 25,
    MaxTktsEntryPerDay: 10001,
    tab: '\u21B2',
    backspace: '\u2190',
    close: '\u2715',
    //---------Current sales summary------------
    CurrentSale_Popover: function (parent) {
        var clickedLink = parent;
        ticketsale.BuildCurrentSale();
        var popoverHTML = Template7.templates.CurrentSaleSummary(ticketsale.CurrentSale);
        myApp.popover(popoverHTML, clickedLink);
    },
    BuildCurrentSale: function () {
        //rest cuurent sale
        ticketsale.CurrentSale.Total = 0;
        ticketsale.CurrentSale.Count = 0;
        ticketsale.CurrentSale.Commision = 0;
        ticketsale.CurrentSale.PrizeCommision = 0;
        //------------------
        if (ticketsale.TicketNumbers_ListView) {
            $.each(ticketsale.TicketNumbers_Selected, function (index, value) {
                ticketsale.CurrentSale.Total += value.totalamt;
                ticketsale.CurrentSale.Count += value.quantity;
                ticketsale.CurrentSale.Commision += (value.quantity * value.sales_commission);
            });
        }
    },
    CurrentSale: {
        Total: 0.0,
        Count: 0,
        Commision: 0.0,
        PrizeCommision: 0.0
    },
    //-----Tkt Posting to server---------
    PostTktsToServer: function () {
        if (ticketsale.TicketNumbers_Selected.length == 0)
        { myApp.alert('You are not selected any tickets.', 'Ticket Sale'); return; }
        var processedTkts = 0;
        var totalNoOfTkts = ticketsale.TicketNumbers_Selected.length;
        //block any user actions during this activity....
        myApp.modal({
            title: 'Processing Tickets',
            text: '<div class="content-block">' +
                   'Please wait while we are Processing the tickets' +
                   '<div class="tkt-progressbar-load-hide"> <p style="height:2px"></p></div>'
        });
        var progressContainer = $$('.tkt-progressbar-load-hide p:first-child');
        if (progressContainer.children('.progressbar').length) { }
        else myApp.showProgressbar(progressContainer, ((100 / totalNoOfTkts) * processedTkts));
        //------------------        
        for (var i = 0; i < ticketsale.TicketNumbers_Selected.length; i++) {
            var QueryStringdata = ticketsale.TicketNumbers_Selected[i].GetTktAsQueryString();
            $$.post(serviceLinks.TktService, 'action_sub=SaveAllData' + QueryStringdata, function (data) {
                try {
                    var returnVal = JSON.parse(data);
                    var entryIndex = ticketsale.GetIndexByTktEntryID(returnVal.entryID);
                    if (returnVal.Result) {
                        if (entryIndex >= 0) {
                            ticketsale.TicketNumbers_Selected[entryIndex].posted = true;
                        }
                    }
                    else {
                        myApp.addNotification({
                            title: 'Ticket Sale Status - Failure',
                            message: returnVal.Message
                        });
                    }
                    processedTkts++;
                    myApp.setProgressbar(progressContainer, ((100 / totalNoOfTkts) * processedTkts)); //update tkt progressbar
                    if (processedTkts == ticketsale.TicketNumbers_Selected.length) {//all tkts are processed
                        ticketsale.RemovePostedTktsEntries();
                        myApp.hideProgressbar(progressContainer); //hide
                        myApp.closeModal();
                    }
                    else {

                    }
                } catch (err) {
                    console.log(err.message)
                }
                //console.log(data);
            }, function (xhr, status) {
                console.log(xhr.responseText);
                processedTkts++;
                if (processedTkts == ticketsale.TicketNumbers_Selected.length) {//all tkts are processed
                    ticketsale.RemovePostedTktsEntries();
                }
            });
        }
    },
    RemovePostedTktsEntries: function () {
        //after processing all the selected tkt numbers...
        var deleteIndexes = [];
        $.each(ticketsale.TicketNumbers_Selected, function (index, value) {
            if (value.posted) {
                deleteIndexes.push(index);
            }
        });
        ticketsale.TicketNumbers_ListView.deleteItems(deleteIndexes);
        if (ticketsale.TicketNumbers_Selected.length == 0) {
            ticketsale.resetBatchSeq(0);
            myApp.alert('Successfully posted all the tickets to the server.', 'Ticket Sale Successfull');
        }
        else {
            myApp.alert('Sorry ,there are some tickets left to save\n please try again.', 'Ticket Sale');
        }
    },
    RemoveTktEntryByentryID: function (entryID) {
        var index = ticketsale.GetIndexByTktEntryID(entryID);
        ticketsale.TicketNumbers_ListView.deleteItem(index);
    }
};

function TicketModel(values) {
    values = values || {};
    this.entryid = values['entryid'] || generateGUID();
    this.ticketnumber = values['ticketnumber'] || '';
    this.categoryid = values['categoryid'] || '';
    this.catgname = values['catgname'] || '';
    this.quantity = values['quantity'] || 0;
    this.entrydate = new Date();
    this.agentid = values['agentid'] || '';
    this.ticket_cost = values['ticket_cost'] || 0;
    this.totalamt = values['totalamt'] || 0;
    this.sales_commission = values['sales_commission'] || 0;
    this.prize_commission = values['prize_commission'] || 0;
    this.posted = false;
    this.batchSeq = ticketsale.TktBatchSeq++;
}
TicketModel.prototype.GetTktAsQueryString = function () {
    var tktquerystring = "&entryid=" + this.entryid +
    "&ticketnumber=" + this.ticketnumber +
    "&categoryid=" + this.categoryid +
    "&catgname=" + this.catgname +
    "&quantity=" + this.quantity +
    "&entrydate=" + this.entrydate.getFullYear() + "-" + (parseInt(this.entrydate.getMonth()) + 1) + "-" + this.entrydate.getDate() +
    "&agentid=" + this.agentid +
    "&batchseq=" + this.batchSeq
    return tktquerystring;
};
TicketModel.prototype.CalculateTotalamt = function () {
    this.totalamt = this.ticket_cost * this.quantity;
};
TicketModel.prototype.UpdateBoxCategoryDetailsByTktNoFormat = function () {
    if (this.categoryid == 2) { //check is this a box category?
        var noArray = this.ticketnumber.toString().split('');
        if (noArray[0] == noArray[1] && noArray[0] == noArray[2]) {
            this.categoryid = 3; //all same
            this.ticket_cost = ticketsale.Category_All[8].tktcost;
            this.sales_commission = ticketsale.Category_All[8].salesCommision;
            this.prize_commission = ticketsale.Category_All[8].priceCommision;
        }
        else if (noArray[0] == noArray[1] || noArray[0] == noArray[2] || noArray[1] == noArray[2]) {
            this.categoryid = 4; //any two
            this.ticket_cost = ticketsale.Category_All[9].tktcost;
            this.sales_commission = ticketsale.Category_All[9].salesCommision;
            this.prize_commission = ticketsale.Category_All[9].priceCommision;
        }
        //else { } //any
    }
    TicketModel.prototype.categoryImage = function () {
        if (this.categoryid == 2 || this.categoryid == 3 || this.categoryid == 4) return 2;
        else return 1;
    }

};
TicketModel.prototype.GetStars = function () {
    if (this.categoryid == 3) return [0, 0, 0];
    else if (this.categoryid == 4) return [0, 0];
    else return [];
}
TicketModel.prototype.CategoryName = function () {
    var self = this;
    $.each(ticketsale.Category_All, function (index, value) {
        if (value.categoryid === self.categoryid) {
            return value.text ? value.text : value.textsub;
        }
    });
};

function generateGUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}