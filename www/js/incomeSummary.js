function incomeSummary(resultdate) {
    var todate = new Date();
    this.resultdate = resultdate || (todate.getFullYear() + "-" + (parseInt(todate.getMonth()) + 1) + "-" + todate.getDate());
    this.incomes = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
}
function incomes(agentname,agentid) {
    this.name = agentname;
    this.agentid = agentid;
    this.incometypes = [];
}
incomeSummary.prototype.GetCurOpeningBalanceDate = function () {
    var month = (this.resultdate.split('-')[1]) - 1;
    var day = this.resultdate.split('-')[2];
    var year = this.resultdate.split('-')[0];
    var d = new Date(year, month, day, 0, 0, 0, 0);
    d.setDate(d.getDate() - 1); //just one day bfore of currently selected date..
    return (d.getDate() + "-" + (parseInt(d.getMonth()) + 1) + "-" + d.getFullYear());
}

incomeSummary.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}

incomeSummary.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
incomeSummary.prototype.initCalender = function () {
    this.resultCalendar = myApp.calendar({
        input: '#calendar-incomeSummary',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            income.setResultDate(year + '-' + (parseInt(month) + 1) + '-' + day)
            income.GetIncomeSummary();
        }
    });
}
incomeSummary.prototype.GetIncomeSummary = function () {
    var postdata = { action_sub: 'GetIncomeSummary', resultdate: this.resultdate, agentid: this.userID };
    this.incomes = [];
    var self = this; //test.htm 
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = ParseJsonString(data);
            if (dat && dat.length > 0) {
                self.Result = true;
                for (var p = 0; p < dat.length; p++) {
                    var incms = new incomes(dat[p].AgentName, dat[p].AgentID);
                    incms.totalBalance = (parseFloat(dat[p].NetBalance) + parseFloat(dat[p].OpeningBalance)).toFixed(2);
                    incms.incometypes.push({ 'description': 'Sales Amount', 'amount': parseFloat(dat[p].SalesAmount).toFixed(2) });
                    incms.incometypes.push({ 'description': 'Sales Commission', 'amount': parseFloat(dat[p].SalesCommission).toFixed(2) });
                    incms.incometypes.push({ 'description': 'Prize Amount', 'amount': parseFloat(dat[p].PrizeAmount).toFixed(2) });
                    incms.incometypes.push({ 'description': 'Prize Commission', 'amount': parseFloat(dat[p].PrizeCommission).toFixed(2) });
                    incms.incometypes.push({ 'description': 'Net Balance', 'itemtotal': true, 'amount': parseFloat(dat[p].NetBalance).toFixed(2) });
                    incms.incometypes.push({ 'description': 'Opening Balance (' + self.GetCurOpeningBalanceDate() + ')', 'amount': parseFloat(dat[p].OpeningBalance).toFixed(2) });
                    incms.incometypes.push({ 'description': 'BALANCE', 'itemtotal': true, 'customcolor': true, 'amount': incms.totalBalance });
                    self.incomes.push(incms);
                }
            }

            else {
                self.Result = false;
            }
            //------------
            var List = myApp.virtualList('#incomeSummary-list', {
                items: self.incomes,
                template: Template7.templates.incomeSummary,
                // search all items, we need to return array with indexes of matched items
                searchAll: function (query, items) {
                    var foundItems = [];
                    for (var i = 0; i < items.length; i++) {
                        // Check if title contains query string
                        if (items[i].name.toUpperCase().indexOf(query.trim().toUpperCase()) >= 0) foundItems.push(i);
                    }
                    // Return array with indexes of matched items
                    return foundItems;
                }
            });
            $$('.accordion-item').on('accordion:open', function () {
                myApp.alert('Accordion item opened');
            });
            //set today as initial date            
            $$('#calendar-incomeSummary').attr('placeholder', self.GetFormattedDate());
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