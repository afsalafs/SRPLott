function dashboard(resultdate) {
    var today = new Date();
    this.resultdate = resultdate || (today.getFullYear() + "-" + (parseInt(today.getMonth()) + 1) + "-" + today.getDate());
    this.resultHour = today.getHours();
    this.dashBoardItems = [];
    //set user_id
    this.userID = userLoggedIn.user_id;
}

dashboard.prototype.GetFormattedDate = function () {
    var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
    var month = (this.resultdate.split('-')[1]) - 1;
    var day = this.resultdate.split('-')[2];
    var year = this.resultdate.split('-')[0];
    return day + ' ' + monthNames[month] + ' ' + year;
}

dashboard.prototype.setResultDate = function (today) {
    this.resultdate = today;
}
dashboard.prototype.clearDashBoardItems = function () { $$('#DashBoardContent').html(''); }
dashboard.prototype.updateDashBoardItems = function () {
    var dashBoardHTML = Template7.templates.DashBoard(this);
    $$('#DashBoardContent').html(dashBoardHTML);
}
dashboard.prototype.getDashBoardItems = function () {
    var postdata = { action_sub: 'GetDailyDashBoard', resultdate: this.resultdate, agentid: this.userID };
    var self = this;
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = ParseJsonString(data);
            if (dat && dat.Result) {
                self.Result = true;
                self.dashBoardItems = [
                    { title: 'Sales Amount', value: dat.SalesAmount, img: 'briefcase',icon:true },
                    { title: 'Sales Commission', value: dat.SalesComm, img: 'collection',icon:true },
                    { title: 'Prize & Commission', value: dat.PrizeAndComm, img: 'collection', icon: true },
                    { title: 'Balance', value: dat.Balance, img: 'persons', icon: true }
                ];
            }
            else {
                self.Result = false;
            }
            //------------
            self.updateDashBoardItems();
        }
        catch (err) {
            console.log(err.message)
        }
        //console.log(data);
    }, function (xhr, status) {
        console.log(xhr.responseText);
    });
}