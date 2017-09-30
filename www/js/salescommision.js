function SalesCommision(resultdate) {
    var today = new Date();
    this.resultdate = resultdate || (today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate());
    this.scommisions = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
}
function scommision(agentname) {
    this.name = agentname;
    this.tkts = [];
}
scommision.prototype.getTotalAmount = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += this.tkts[i].TotalCommission
    }
    return total;
}
SalesCommision.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}

SalesCommision.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
SalesCommision.prototype.initCalender = function () {
    this.resultCalendar = myApp.calendar({
        input: '#calendar-SalesCommision',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            var salescommision = new SalesCommision(year + '-' + (parseInt(month) + 1) + '-' + day);
            salescommision.GetSalesCommision();
        }
    });    
}
SalesCommision.prototype.GetSalesCommision = function () {
    var postdata = { action_sub: 'SalesCommision', resultdate: this.resultdate, agentid: this.userID };
    var salesCommObj = this;
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = JSON.parse(data);
            if (dat && dat.length > 0) {
                salesCommObj.Result = true;
                for (var s = 0; s < dat.length; s++) {
                    if (!dat[s].grouped) {
                        scomm = new scommision(dat[s].AgentName);
                        for (var j = 0; j < dat.length; j++) {
                            if (dat[j].AgentName === scomm.name) {
                                scomm.tkts.push({
                                    'TicketCategory': dat[j].TicketCategory,
                                    'TicketsQuantity': dat[j].TicketsQuantity,
                                    'CommRate': dat[j].CommRate,
                                    'TotalCommission': dat[j].TotalCommission
                                });
                                dat[j].grouped = true;
                            }
                        }
                        salesCommObj.scommisions.push(scomm);
                    }
                }
            }
            else {
                salesCommObj.Result = false;
            }
            //------------
            var List = myApp.virtualList('#salescomm-list', {
                items: salesCommObj.scommisions,
                template: Template7.templates.SalesCommision,
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
            $$('#calendar-SalesCommision').attr('placeholder', salesCommObj.GetFormattedDate());
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