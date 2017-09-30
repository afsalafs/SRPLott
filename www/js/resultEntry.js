function resultEntry(resultdate) {
    var todate = new Date();
    this.resultdate = resultdate || (todate.getFullYear() + "-" + (parseInt(todate.getMonth()) + 1) + "-" + todate.getDate());
    this.prizes = [
        {
            id: 0, title: "Main Prizes", row: [{ col: [{ no: 1 }, { no: 2 }, { no: 3}] }, { col: [{ no: 4 }, { no: 5}]}]
        },
        {
            id: 1, title: "Complimentry Prizes", row: [{ col: [{ no: 6 }, { no: 7 }, { no: 8}] }, { col: [{ no: 9 }, { no: 10 }, { no: 11}] }
            , { col: [{ no: 12 }, { no: 13 }, { no: 14}] }, { col: [{ no: 15 }, { no: 16 }, { no: 17}] }, { col: [{ no: 18 }, { no: 19 }, { no: 20}] }, { col: [{ no: 21 }, { no: 22 }, { no: 23}] }, { col: [{ no: 24 }, { no: 25 }, { no: 26}] }, { col: [{ no: 27 }, { no: 28 }, { no: 29}] }, { col: [{ no: 30 }, { no: 31 }, { no: 32}] }, { col: [{ no: 33 }, { no: 34 }, { no: 35}]}]
        },
         {
             id: 2, title: "More Prizes", row: [{ col: [{ no: 36 }, { no: 37 }, { no: 38}] }, { col: [{ no: 39 }, { no: 40 }, { no: 41}]}]
         }
        ];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
    this.MaxtabIndex = 5;
    this.MintabIndex = 1;
    this.resultEntryID = -1;
    this.CompulsoryPrizeLimit = 1;
    this.NewLineLimit = 5;
    this.tab = '\u21B2';
    this.backspace = '\u2190';
}
resultEntry.prototype.openResultEntryBox = function () {
    setTimeout(function () { myApp.accordionOpen("#AccordionItem0"); resultentry.onAccordionClick(0); }, 0);
}
resultEntry.prototype.onAccordionClick = function (id) {
    if (id == 0) { this.MaxtabIndex = 5; this.MintabIndex = 1; }
    else if (id == 1) { this.MaxtabIndex = 35; this.MintabIndex = 6; }
    else { this.MaxtabIndex = 41; this.MintabIndex = 36; }
    this.GoToNextCtrl(-1);
    this.SetRedBorderFocusCtrl();
}
resultEntry.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
resultEntry.prototype.initCalender = function () {
    var self = this;
    this.resultCalendar = myApp.calendar({
        input: '#calendar-TktResultEntry',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            self.resultdate = year + '-' + (parseInt(month) + 1) + '-' + day;
            self.GetResults();
        }
    });
}
resultEntry.prototype.SetNumber = function (number) {
    if (!this.currentfocusCtrl) { this.GoToNextCtrl(-1); }
    if (this.currentfocusCtrl.value.length < this.currentfocusCtrl.max.length) {
        this.currentfocusCtrl.value += number;
    }
    this.OnCtrlKeyPress(this.currentfocusCtrl, '');
};
resultEntry.prototype.ClearInputFields = function () {
    var self = this;
    $.each(this.input_resultEntry, function (index, element) {
        if (element.tabIndex >= self.MintabIndex && element.tabIndex <= self.MaxtabIndex) {
            $$(element).val('');
            self.OnCtrlKeyPress(element, '');
        }
    });
    this.GoToNextCtrl(-1);
};
resultEntry.prototype.SetAction = function (action) {
    switch (action) {
        case '<':
            this.currentfocusCtrl.value = this.currentfocusCtrl.value.slice(0, -1);
            break;
        case 'clr':
            this.ClearInputFields();
            this.GoToNextCtrl(-1); //reset focus to first tab index..
            break;
        case 'tab':
            if (!this.currentfocusCtrl) { this.GoToNextCtrl(-1); }
            else this.GoToNextCtrl(this.currentfocusCtrl.tabIndex);
            this.SetRedBorderFocusCtrl();
            break;
    }
};
resultEntry.prototype.addResults = function () {
    var popupHTML = Template7.templates.resultEntryVKB(this);
    myApp.popup(popupHTML);
}
resultEntry.prototype.PostResults = function () {
    var self = this;
    //ticket result preperation for posting to server
    var results = [];
    for (var i = 0; i < 3; i++)
        this.prizes[i].row.forEach(function (r) {
            r.col.forEach(function (c) {
                if (c.val)
                    results.push(c.val);
            })
        });
    //here we are chking the first 5 prizes are entered,rest are not compulsory.......
    if (results.length < this.CompulsoryPrizeLimit) {
        myApp.alert('You should enter atleast first ' + this.CompulsoryPrizeLimit + ' Ticket Prize Numbers', 'Result Publishing'); return;
    }
    //show a preview of the results, and get a confirm from the user to post to server..
    var prvStr = '';
    results.forEach(function (r, i) {
        if (i < self.NewLineLimit) {
            prvStr += r + '\n';
        }
        else {
            prvStr += r + ',';
        }
    });
    prvStr = prvStr.replace(/,\s*$/, "");
    myApp.confirm('<div class="item-input"><textarea style="height:200px;" class="resizable">' + prvStr + '</textarea></div> ',
     'Prized Tickets', function () {
         //-------------------------------------------------------------------------------------------------------------
         var postdata = { action_sub: 'resultEntry', resultdate: self.resultdate, resultentryid: self.resultEntryID, Result: results.toString() };
         $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
             try {
                 var dat = JSON.parse(data);
                 if (dat && dat.Result) {
                     self.resultEntryID = dat.resultEntryID || -1; //in case if it was a new result enrty for this particular date, it will get assigned by new id ,otherwise it is refereshing the same id
                     myApp.alert('Thank you,Successfully posted the results to server.', 'Result Publishing');
                 }
                 else {
                     myApp.alert('Sorry,Can not post the results to server,Please try again.', 'Result Publishing');
                 }
             }
             catch (err) {
                 console.log(err.message)
             }
             //console.log(data);
         }, function (xhr, status) {
             console.log(xhr.responseText);
         });
         //-------------------------------------------------------------------------------------
     });
}
 resultEntry.prototype.GetResults = function () {
     var self = this;
     var postdata = { action_sub: 'GetResult', resultdate: this.resultdate };
     $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
         try {
             var dat = JSON.parse(data);
             if (dat[0]) {
                 self.resultEntryID = dat[0].resultEntryID || -1;
                 self.prizes[0].row[0].col[0].val = dat[0].firstposition;
                 self.prizes[0].row[0].col[1].val = dat[0].secondposition;
                 self.prizes[0].row[0].col[2].val = dat[0].thirdposition;
                 self.prizes[0].row[1].col[0].val = dat[0].fourthposition;
                 self.prizes[0].row[1].col[1].val = dat[0].fifthposition;
                 for (var i = 1; i <= dat[0].sixththpositioncount; i++) {
                     var keyName = '_' + (i + 5) + 'thNo';
                     var _row = 1; //default
                     if (i >= 31) _row = 2;
                     //-----once find the main array we have to set the ctrl value to its corresponding col val
                     self.prizes[_row].row.forEach(function (r) {
                         r.col.forEach(function (c) {
                             if (c.no == (i + 5)) c.val = dat[0][keyName];
                         })
                     });
                 }
             }
             else {
                 //nothing;; u have to reset the array 
                 for (var i = 0; i < 3; i++)
                     self.prizes[i].row.forEach(function (r) {
                         r.col.forEach(function (c) {
                             c.val = '';
                         })
                     });
             }
             //initialize the virtuallist------------
             self.List = myApp.virtualList('#tktresultEntry-list', {
                 items: self.prizes,
                 template: Template7.templates.resultEntry
             });
             //set today as initial date            
             $$('#calendar-TktResultEntry').attr('placeholder', self.GetFormattedDate());
             self.input_resultEntry = $$('input[data-key="PrizeValue"]');
             $.each(self.input_resultEntry, function (index, element) {
                 $(element).on('keyup keydown change', function (e) {
                     var theEvent = e || window.event;
                     var iKeyCode = theEvent.keyCode || theEvent.which;
                     return self.OnCtrlKeyPress(e.target, iKeyCode);
                 });
                 $(element).on('click', function (e) {
                     self.currentfocusCtrl = e.target;
                     self.SetRedBorderFocusCtrl();
                 });
             });
             //open first  item in the list default..
             self.openResultEntryBox();
         }
         catch (err) {
             console.log(err.message)
         }
         //console.log(data);
     }, function (xhr, status) {
         console.log(xhr.responseText);
     });

 }
 resultEntry.prototype.DeleteResults = function () {
     
         var postdata = { action_sub: 'DeleteResult', resultdate: this.resultdate, resultentryid: this.resultEntryID };
         $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
             try {
                 var dat = JSON.parse(data);
                 if (dat.Result) {
                     myApp.alert('Successfully Deleted the Result for the Date ' + postdata.resultdate, 'Delete Results');
                 }
                 else {
                     myApp.alert('Sorry can not delete the results for the Date ' + postdata.resultdate+'\n Please try again.', 'Delete Results');
                 }
             }
             catch (err) {
                 console.log(err.message)
             }
             //console.log(data);
         }, function (xhr, status) {
             console.log(xhr.responseText);
         });
     
 }
 resultEntry.prototype.OnCtrlKeyPress = function (ctrl, iKeyCode) {
     if (iKeyCode != 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57)) {
         return false;
     }
     else if (iKeyCode == 13) {
         return false
     }
     var txtval = ctrl.value.replace(/[^0-9]/g, '');
     //we have three  main rows in the prizes array,check this ctrl belongs which array ?..
     var _row = 0; //default
     if (ctrl.tabIndex >= 6 && ctrl.tabIndex <= 35) _row = 1;
     else if (ctrl.tabIndex >= 36) _row = 2;
     //-----once find the main array we have to set the ctrl value to its corresponding col val
     this.prizes[_row].row.forEach(function (r) {
         r.col.forEach(function (c) {
             if (c.no == ctrl.tabIndex) c.val = txtval;
         })
     });
     if (iKeyCode != 9 && iKeyCode != 8)
         if (ctrl.value.length >= ctrl.max.length) {
             this.GoToNextCtrl(ctrl.tabIndex);
             this.SetRedBorderFocusCtrl();
             return false;
         }
 };
resultEntry.prototype.GoToNextCtrl = function (ctrl_tabindex) {
    var self = this;
    var tabIndex = (ctrl_tabindex + 1);
    if (tabIndex > this.MaxtabIndex || tabIndex < this.MintabIndex) tabIndex = this.MintabIndex;
    $.each(this.input_resultEntry, function (index, item) {
        if (item.tabIndex == tabIndex) {
            self.currentfocusCtrl = item;
        }
    });
    this.currentfocusCtrl.focus();
};
resultEntry.prototype.SetRedBorderFocusCtrl = function () {
    var self = this;
    $.each(this.input_resultEntry, function (index, item) {
        if (item == self.currentfocusCtrl) {
            $(item).parents('.col-33').eq(0).css({ "border": "1px solid red" });
        }
        else {
            $(item).parents('.col-33').eq(0).css({ "border": "1px solid #ddd" });
        }
    });
}
resultEntry.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}