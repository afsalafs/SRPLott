function agentPayment(paymentDateFrom, paymentDateTo, userID) {
    var todate = new Date();
    var frmdate = new Date();
    frmdate.setDate(frmdate.getDate() - 7);
    this.resultdateFrom = paymentDateFrom || (frmdate.getFullYear() + "-" + (parseInt(frmdate.getMonth()) + 1) + "-" + frmdate.getDate());
    this.resultdateTo = paymentDateTo || (todate.getFullYear() + "-" + (parseInt(todate.getMonth()) + 1) + "-" + todate.getDate());
    this.Payments = [];
    this.resultCalendar = '';
    //set user_id
    this.userID = userID || userLoggedIn.user_id;
}
function payment(agentid) {
    this.agentid = agentid;
    this.payments = [];
    this.isAdmin = userLoggedIn.isAdmin;
}
agentPayment.prototype.getPaymentList = function () {
    var self = this;
    if (userLoggedIn.isAdmin) {
        userlist.users(function () { self.GetPayments(); });
    }
    else {
        this.GetPayments();
    }
}

agentPayment.prototype.GetFormattedDate = function () {
    var month = this.resultdateTo.split('-')[1];
    month = month.length > 1 ? month : '0' + month;
    var day = this.resultdateTo.split('-')[2];
    day = day.length > 1 ? day : '0' + day;
    var year = this.resultdateTo.split('-')[0];
    return (day + '-' + month + '-' + year);
}

agentPayment.prototype.setResultDateFrom = function (today) {
    this.resultdateFrom = today;
}

agentPayment.prototype.setResultDateTo = function (today) {
    this.resultdateTo = today;
}
agentPayment.prototype.initCalender = function () {
    var self = this;
    var today = new Date();
    var weekBefore = new Date().setDate(today.getDate() - 7);
    this.resultCalendar = myApp.calendar({
        input: '#calendar-agentPayment',
        dateFormat: 'dd-mm-yyyy',
        rangePicker: true,
        closeOnSelect: true,
        events: {
            from: weekBefore,
            to: today
        },
        onDayClick: function (p, dayContainer, year, month, day) {
            if (p.value && p.value.length == 1) {
                self.setResultDateTo(year + '-' + (parseInt(month) + 1) + '-' + day);
                self.GetPayments();
            }
            else self.setResultDateFrom(year + '-' + (parseInt(month) + 1) + '-' + day);
        }
    });
}
agentPayment.prototype.deletePayment = function (paymentID) {
    var postdata = { action_sub: 'DeletePayment', paymentID: paymentID };
    myApp.confirm("Are you sure want to delete this payment?", "Delete Payment?", function () {
        $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
            try {
                var dat = ParseJsonString(data);
                if (dat && dat.Result == true) {
                    myApp.alert('Successfully Deleted the payment', 'Delete Payment');
                    $$('#' + paymentID).hide();
                }
                else
                    myApp.alert('Sorry , Can\'nt delete the payment,please try again', 'Delete Payment');
            } catch (err) {
                console.log(err.message)
            }
            //console.log(data);
        }, function (xhr, status) {
            console.log(xhr.responseText);
        });
    });
}
agentPayment.prototype.addPayment = function (agentID) {
    myApp.modal({
        title: 'Add Payment',
        text: Template7.templates.addPayment({ today: this.GetFormattedDate().split('-').reverse().join('-') }),
        buttons: [
      {
          text: 'Ok',
          bold: true,
          onClick: function () {
              var postdata = myApp.formToJSON('#form-addPayment');
              postdata.agentid = agentID;
              postdata.action_sub = "addPayment";
              if (postdata.debitcredit === 'Paid') postdata.debitcredit = 'Credit';
              else postdata.debitcredit = 'Debit';
              $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
                  try {
                      var dat = ParseJsonString(data);
                      if (dat.Result) {
                          myApp.alert('Successfully added the payment', 'Payment');
                      }
                      else myApp.alert('Sorry can not add the payment', 'Payment');
                  }
                  catch (err) {
                      console.log(err.message)
                  }
                  //console.log(data);
              }, function (xhr, status) {
                  console.log(xhr.responseText);
              });
          }
      },
      {
          text: 'Cancel',
          bold: true
      }
    ]
    })
}
agentPayment.prototype.GetPayments = function () {
    var postdata = { action_sub: 'agentPayment', resultdateFrom: this.resultdateFrom, resultdateTo: this.resultdateTo, agentid: this.userID };
    var self = this;
    this.Payments = [];
    $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
        try {
            var dat = ParseJsonString(data);
            if (dat && dat.length > 0) {
                self.Result = true;
                for (var p = 0; p < dat.length; p++) {
                    if (!dat[p].grouped) {
                        pmt = new payment(dat[p].agentid);
                        pmt.agentName = dat[p].agentid.replace(/[0-9]/g, '');
                        for (var j = 0; j < dat.length; j++) {
                            if (dat[j].agentid === pmt.agentid) {
                                pmt.payments.push({
                                    'paymentID': dat[j].PaymentID,
                                    'paymentDate': dat[j].PaymentDate,
                                    'Credit': dat[j].Credit,
                                    'Debit': dat[j].PayToAgent
                                });
                                dat[j].grouped = true;
                            }
                        }
                        self.Payments.push(pmt);
                    }
                }
            }
            else {
                self.Result = false;
            }
            //show all users payments if the current user is admin------------
            if (userLoggedIn.isAdmin) {
                var users = userlist.users();
                if (users && users.length > 0) {
                    users.forEach(function (r) {
                        var found = false;
                        if (self.Payments.length > 0)
                            found = self.Payments.some(function (el) {
                                return el.agentid === r.AgentID;
                            });
                        if (!found) {
                            p = new payment(r.AgentID);
                            p.agentName = r.AgentName;
                            p.payments = false;
                            self.Payments.push(p);
                        }
                    });
                }
            }
            //------------
            self.List = myApp.virtualList('#agentPayment-list', {
                items: self.Payments,
                template: Template7.templates.agentPayment,
                // search all items, we need to return array with indexes of matched items
                searchAll: function (query, items) {
                    var foundItems = [];
                    for (var i = 0; i < items.length; i++) {
                        // Check if title contains query string
                        if (items[i].agentid.toUpperCase().indexOf(query.trim().toUpperCase()) >= 0) foundItems.push(i);
                    }
                    // Return array with indexes of matched items
                    return foundItems;
                }
            });
            //set today as initial date            
            $$('#calendar-agentPayment').attr('placeholder', self.GetFormattedDate());
            if (self.List.items.length == 0)
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