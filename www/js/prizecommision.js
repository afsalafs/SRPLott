function PrizeCommision(resultdate) {
    var today = new Date();
    this.resultdate = resultdate || (today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate());
    this.pcommisions = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
}
function pcommision(agentname) {
    this.name = agentname;
    this.tkts = [];
}
pcommision.prototype.getTotalAmount = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += this.tkts[i].TotalComm
    }
    return total;
}
PrizeCommision.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}

PrizeCommision.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
PrizeCommision.prototype.initCalender = function () {
    this.resultCalendar = myApp.calendar({
        input: '#calendar-PrizeCommision',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            var prizecommision = new PrizeCommision(year + '-' + (parseInt(month) + 1) + '-' + day);
            prizecommision.GetPrizeCommision();
        }
    });    
}
PrizeCommision.prototype.GetPrizeCommision = function () {
    var postdata = { action_sub: 'PrizeCommision', resultdate: this.resultdate, agentid: this.userID };
    var prizeCommObj = this;
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = ParseJsonString(data);
            if (dat && dat.length > 0) {
                prizeCommObj.Result = true;
                for (var p = 0; p < dat.length; p++) {
                    if (!dat[p].grouped) {
                        pcomm = new pcommision(dat[p].AgentName);
                        for (var j = 0; j < dat.length; j++) {
                            if (dat[j].AgentName === pcomm.name) {
                                pcomm.tkts.push({
                                    'TicketNumber': dat[j].TicketNumber,
                                    'TicketCategory': dat[j].TicketCategory,
                                    'TicketsQuantity': dat[j].TicketsQuantity,
                                    'CommRate': dat[j].CommRate,
                                    'TotalComm': dat[j].TotalComm,
                                    'PrizeLevel': dat[j].PrizeLevel
                                });
                                dat[j].grouped = true;
                            }
                        }
                        prizeCommObj.pcommisions.push(pcomm);
                    }
                }
            }
            else {
                prizeCommObj.Result = false;
            }
            //------------
            var List = myApp.virtualList('#prizecomm-list', {
                items: prizeCommObj.pcommisions,
                template: Template7.templates.PrizeCommision,
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
            //set today as initial date            
            $$('#calendar-PrizeCommision').attr('placeholder', prizeCommObj.GetFormattedDate());
            if (List.items.length == 0)
                $$('.searchbar-not-found').show();
            else
                $$('.searchbar-not-found').hide();
        }
        catch (err) {
            console.log(err.message)
        }
        //console.log(data);
    }, function (xhr, status) {
        console.log(xhr.responseText);
    });
}