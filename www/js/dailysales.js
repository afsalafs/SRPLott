function DailySales(resultdate) {
    var today = new Date();
    this.resultdate = resultdate || (today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate());
    this.dsales = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userLoggedIn.user_id;
}
function Dsales(agentname,agentid) {
    this.name = agentname;
    this.agentid = agentid;
    this.tkts = [] ;
}
Dsales.prototype.getTotalAmount = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += parseFloat(this.tkts[i].GroupTotalAmount);
    }
    this.TotalAmount = total;
}
Dsales.prototype.getTotalQuantity = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += parseInt(this.tkts[i].quantity);
    }
    return total;
}
Dsales.prototype.getTotalCommision = function () {
    var total = 0;
    for (var i = 0; i < this.tkts.length; i++) {
        total += parseFloat(this.tkts[i].Total_commission);
    }
    return total;
}
DailySales.prototype.GetFormattedDate = function () {
    var month = this.resultdate.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdate.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdate.split('-')[0];
    return (day + '-' + month + '-' + year);
}

DailySales.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
DailySales.prototype.initCalender = function () {
    var self = this;
    self.resultCalendar = myApp.calendar({
        input: '#calendar-dailysales',
        dateFormat: 'dd-mm-yyyy',
        closeOnSelect:true,
        onDayClick: function (p, dayContainer, year, month, day) {
            //for best optimization avoid creating new obj & keep update on existing obj
            self.resultdate = year + '-' + (parseInt(month) + 1) + '-' + day;
            self.dsales = [];
            self.GetDailySales();
        }
    });
    //find the search bar and set a custom function for reset the tkts properties on search clear
    var mySearchbar = $$('.searchbar')[0].f7Searchbar;
    mySearchbar.params["onDisable"] = mySearchbar.params["onClear"] = function clearSearch(s, e) {
        self.List.items = JSON.parse(JSON.stringify(self.dsales))
        self.List.update(); //framework7 buil in  methods to rerender the Vlist.
    };
}
DailySales.prototype.RemoveTktFrmSrverByentryID = function (entryid) {
    var postdata = { action_sub: 'Deletemain', tempid: entryid, agentid: this.userID };
    myApp.confirm("Are you sure want to delete this ticket?", "Delete Ticket?", function () {        
        $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
            try {
                var dat = ParseJsonString(data);
                if (dat && dat.Result == true) {
                    myApp.swipeoutDelete(myApp.swipeoutOpenedEl, '');
                }
                myApp.alert(dat.Message, 'Delete Ticket');
            } catch (err) {
                console.log(err.message)
            }
            //console.log(data);
        }, function (xhr, status) {
            console.log(xhr.responseText);
        });
    });
}

DailySales.prototype.GetDailySales = function () {
    var postdata = { action_sub: 'GetDailySale', entrydate: this.resultdate, agentid: this.userID };
    var dsalesObj = this;
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = ParseJsonString(data);
            if (dat && dat.length > 0) {
                dsalesObj.Result = true;
                for (var s = 0; s < dat.length; s++) {
                    if (!dat[s].grouped) {
                        dsales = new Dsales(dat[s].username, dat[s].agentid);
                        var Cur_TktTimeGrp = '';
                        for (var j = 0; j < dat.length; j++) {
                            if (dat[j].agentid === dsales.agentid) {
                                var tktHrMnt = formatAMPM(dat[j].Time);
                                if (Cur_TktTimeGrp == '' || Cur_TktTimeGrp.time != tktHrMnt) {
                                    Cur_TktTimeGrp = { time: tktHrMnt, values: [], GroupTotalAmount: 0, selected: false };
                                    dsales.tkts.push(Cur_TktTimeGrp);
                                }
                                Cur_TktTimeGrp.values.push({
                                    'entryid': dat[j].entryid,
                                    'Time': dat[j].Time.split(' ')[1],
                                    'ticketnumber': dat[j].ticketnumber,
                                    'categoryid': dat[j].categoryid,
                                    'category_name': dat[j].category_name,
                                    'subcategory': dat[j].catgname,
                                    'quantity': dat[j].quantity,
                                    'ticket_cost': dat[j].ticket_cost,
                                    'totalamt': dat[j].totalamt,
                                    'Total_commission': dat[j].Total_commission,
                                    'Netamount': dat[j].Netamount,
                                    'batchseq': dat[j].batchseq || 0,
                                    'highlight': false
                                });
                                Cur_TktTimeGrp.GroupTotalAmount += parseFloat(dat[j].totalamt);
                                Cur_TktTimeGrp.values.sort(function (a, b) {
                                    return parseInt(b.batchseq) - parseInt(a.batchseq);
                                });
                                dat[j].grouped = true;
                            }
                        }
                        dsales.getTotalAmount();
                        dsalesObj.dsales.push(dsales);
                    }
                }
            }
            else {
                dsalesObj.Result = false;
            }
            //------------
            dsalesObj.List = myApp.virtualList('#dailysale-list', {
                items: JSON.parse(JSON.stringify(dsalesObj.dsales)), //pure clone of the main array ,so that any changes in cloned array will not affect the main array,simply both have 2 diff memmories...
                template: Template7.templates.dailysales,
                updatableScroll: true,
                cache: false, //disable cache ,coz we have to update the list item display format based on search
                // search all items, we need to return array with indexes of matched items
                searchAll: function (query, items) {
                    var foundItems = [];
                    for (var i = 0; i < items.length; i++) {
                        if (isNaN(query.trim())) {// Check if title contains query string
                            if (items[i].name.toUpperCase().indexOf(query.trim().toUpperCase()) >= 0) { foundItems.push(i); }
                        }
                        else { //check for the ticket number in the query string
                            loop1: for (j = 0; j < items[i].tkts.length; j++) {
                                loop2: for (k = 0; k < items[i].tkts[j].values.length; k++) {
                                    if (items[i].tkts[j].values[k].ticketnumber === query.trim()) {
                                        items[i].tkts[j].selected = true;
                                        items[i].tkts[j].values[k].highlight = true;
                                        if (foundItems.indexOf(i) < 0)
                                            foundItems.push(i);
                                    }
                                }
                            }
                        }
                    }
                    // Return array with indexes of matched items
                    return foundItems;
                }
            });
            dsalesObj.List.pageContent['off']('scroll', dsalesObj.List.handleScroll);
            //set today as initial date            
            $$('#calendar-dailysales').attr('placeholder', dsalesObj.GetFormattedDate());
            if (dsalesObj.List.items.length == 0)
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

function formatAMPM(datetimeString) {//dd-mm-yyyy 00:00:00;
    date = new Date(datetimeString);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ' ' + ampm; //skip seconds
    return strTime;
}