function dailyWinner(resultdate) {
    var today = new Date();
    this.resultdate = resultdate || (today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate());
    this.winners = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
}
function winner(agentname) {
    this.name = agentname;
    this.tkts = [];
}
winner.prototype.getTotalAmount = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += this.tkts[i].Total_prize
    }
    return total;
}
dailyWinner.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}

dailyWinner.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
dailyWinner.prototype.initCalender = function () {
    this.resultCalendar = myApp.calendar({
        input: '#calendar-TktWinner',
        closeOnSelect: true,
        dateFormat: 'dd-mm-yyyy',
        onDayClick: function (p, dayContainer, year, month, day) {
            var dailywinner = new dailyWinner(year + '-' + (parseInt(month) + 1) + '-' + day);
            dailywinner.GetWinners();
        }
    });
}

dailyWinner.prototype.GetWinners = function () {
    var postdata = { action_sub: 'GetWinners', resultdate: this.resultdate, agentid: this.userID };
    var winnerObj = this;
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = JSON.parse(data);
            if (dat && dat.length > 0) {
                winnerObj.Result = true;
                for (var w = 0; w < dat.length; w++) {
                    if (!dat[w].grouped) {
                        win = new winner(dat[w].agent_name);
                        for (var j = 0; j < dat.length; j++) {
                            if (dat[j].agent_name === win.name) {
                                win.tkts.push({
                                    'ticketnumber': dat[j].ticketnumber,
                                    'catg_name': dat[j].catg_name,
                                    'catgname': dat[j].catgname,
                                    'quantity': dat[j].quantity,
                                    'catg_prize': dat[j].catg_prize,
                                    'Total_prize': dat[j].Total_prize,
                                    'prize_level': dat[j].prize_level
                                });
                                dat[j].grouped = true;
                            }
                        }
                        winnerObj.winners.push(win);
                    }
                }
            }
            else {
                winnerObj.Result = false;
            }
            //------------
            var List = myApp.virtualList('#winners-list', {
                items: winnerObj.winners,
                template: Template7.templates.TodaysWinner,
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
            $$('#calendar-TktWinner').attr('placeholder', winnerObj.GetFormattedDate());
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