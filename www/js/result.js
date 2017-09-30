function result(resultdate) {
    this.today = new Date();
    this.resultdate = resultdate || (this.today.getFullYear() + "-" + (parseInt(this.today.getMonth()) + 1) + "-" + this.today.getDate());
    this.Prizes = Array();
    this.resultCalendar = '';
}
result.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}
result.prototype.GetYear = function () {
    return this.resultdate.split('-')[0];
    
}
result.prototype.GetMonth = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    return month;
}
result.prototype.GetDate = function () {
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    return day;
}
result.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
result.prototype.initCalender = function () {
    this.resultCalendar = myApp.calendar({
        input: '#calendar-TktResult',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            TktPrizeResult.setResultDate(year + '-' + (parseInt(month) + 1) + '-' + day);
            TktPrizeResult.GetResult();
        }
    });
}
result.prototype.socialshare = function () {
    if (this.Prizes.length > 0) {
        var c = 0;
        var str = '';
        $.each(this.Prizes, function (idx2, val2) {
            if (val2.divider)
            { }
            else {
                str = str + (val2.position ? (val2.positionValue + "\n") : (val2.positionValue + ", "));
            }
        });
        str = str.replace(/,\s*$/, "");
        try {
            window.plugins.socialsharing.share(str, 'Prize Tickets');
        } catch (e) {
            myApp.modal({ title: 'Prized Tickets', text: '<div class="item-input"><textarea style="height:200px;" class="resizable">' + str + '</textarea></div> ', buttons: [{ text: 'close', close: true, bold: true}] });
        }

    }
    else {
        myApp.alert('Not found any tickets to share.', 'Share Ticket Numbers');
    }
}
result.prototype.GetResult = function () {
    var TktPrizeResult = this;
    var postdata = { action_sub: 'GetResult', resultdate: TktPrizeResult.resultdate };
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = JSON.parse(data);
            if (dat[0]) {
                TktPrizeResult.Result = true;
                TktPrizeResult.Prizes = [{ position: 'FirstPrize', positionNo: 1, positionValue: dat[0].firstposition },
                { position: 'SecondPrize', positionNo: 2, positionValue: dat[0].secondposition },
                { position: 'ThirdPrize', positionNo: 3, positionValue: dat[0].thirdposition },
                { position: 'FourthPrize', positionNo: 4, positionValue: dat[0].fourthposition },
                { position: 'FifthPrize', positionNo: 5, positionValue: dat[0].fifthposition }
                ];
                TktPrizeResult.Prizes.push({ divider: true, text: 'Complimentry Prizes' });
                for (var i = 1; i <= dat[0].sixththpositioncount; i++) {
                    var keyName = '_' + (i + 5) + 'thNo'
                    TktPrizeResult.Prizes.push({ 'positionValue': dat[0][keyName] });
                }
            }
            else {
                TktPrizeResult.Result = false;
            }
            //------------
            var List = myApp.virtualList('#tktresult-list', {
                items: TktPrizeResult.Prizes,
                template: Template7.templates.TktPrizeResult,
                // search all items, we need to return array with indexes of matched items
                searchAll: function (query, items) {
                    var foundItems = [];
                    for (var i = 0; i < items.length; i++) {
                        // Check if title contains query string
                        if (items[i].positionValue && items[i].positionValue.indexOf(query.trim().toUpperCase()) >= 0) foundItems.push(i);
                    }
                    // Return array with indexes of matched items
                    return foundItems;
                }
            });
            //set today as initial date            
            $$('#calendar-TktResult').attr('placeholder', TktPrizeResult.GetFormattedDate());
            if (List.items.length == 0)
                $$('.searchbar-not-found').show();
            else {
                $$('.searchbar-not-found').hide();
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