    function ajaxLogIn(theForm) {
    var formData = $(theForm).serialize()
    $$.post(serviceLinks.TktService, formData, function (data) {
        try {
            if (data) {
                var userData = JSON.parse(data);
                if (userData.Result) {
                    //append menus
                    userData = BuildMenus(userData)
                    //setadmin flag
                    userData.isAdmin = (userData.user_id === 'ADMIN');
                    //store data
                    storeData(userData);
                    //parse userdata to html 
                    parseUserInfoData(userData);
                    myApp.closeModal();
                    myApp.openPanel('left');
                }
                else {
                    myApp.alert(userData.Message, 'User validation');
                }
            }
            else { myApp.alert('Nothing found', 'User validation'); }
        } catch (err) {
            console.log(err.message)
        }
        //console.log(data);
    }, function (xhr, status) {
        console.log(xhr.responseText);
    });
    return false;
}

function BuildMenus(userData) {
    //general menus
    userData.menus = new Array();
    userData.menus.push({ name: 'ticketsale', img: 'form', text: 'Ticket Sale' });
    userData.menus.push({ name: 'dailysale', img: 'briefcase', text: 'Daily Sales' });
    userData.menus.push({ name: 'result', img: 'tables', text: 'View Results' });
    userData.menus.push({ name: 'TodaysWinner', img: 'blog', text: 'Todays Winner' });
    userData.menus.push({ name: 'SalesCommision', img: 'docs', text: 'Sales Commision' });
    userData.menus.push({ name: 'PrizeCommision', img: 'docs', text: 'Prize Commision' });
    userData.menus.push({ name: 'incomeSummary', img: 'linkedin', text: 'Income' });
    //userData.menus.push({ name: 'underProcess', img: 'user', text: 'My Account' });
    //--------------------
    return userData;
}

function parseUserInfoData(UserInfodata) {
    if (!UserInfodata) { UserInfodata = { first_name: 'Guest', menus: false }; }
    if (UserInfodata) {
        var UserInfo = $('.user_login_info');
        var html = Template7.templates.UserInfoTemplate(UserInfodata);
        UserInfo.html(html)
        bindEvents([bindings[6], bindings[7]]);
        if (!UserInfodata.menus) {
            mainView.hideToolbar(true);
            if (DashBorad) DashBorad.clearDashBoardItems();
        }
        else {
            mainView.showToolbar(true);
            userLoggedIn = UserInfodata;
        }
    }
}
    

function ajaxRegister(theForm) {
    var $ = jQuery;
    $('#loader').fadeIn();
    var formData = $(theForm).serialize(),
note = $('#Note');
    $.ajax({
        type: "GET",
        url: "http://172.16.106.110/services/CustomerService.svc/ValidateID",
        data: formData,
        success: function (response) {



            if (response["Status"] === 'success') {


                if ($.trim(response["Mobile"]).length == 0) {
                    myApp.alert('', 'رقم الجوال غير موجود!');
                    $('#SendSMSDivFirst').hide();
                    $('#SendSMSDivSecond').hide();
                    myApp.closeModal(".popup.modal-in");
                }

                else if (response["User_Verified"] === 'Y') {
                    myApp.alert('', 'انت مسجل مسبقا!');
                    $('#SendSMSDivFirst').hide();
                    $('#SendSMSDivSecond').hide();
                    $('#RegisterForm').show();
                    $(".popup-signup").attr({ "style": "display:none" });

                    myApp.closeModal(".popup.modal-in");
                    //                    $(".popup-login").attr({ "style": "display:none" });
                    //                    myApp.closeModal(".popup-login");

                }

                else {
                    //myApp.alert('', 'success!');
                    $("#mobile_no").val(response["Mobile"]);
                    $("#mobile_no").prop("readonly", true);
                    $("#IDNumDummy").val(response["IDNo"]);
                    $("#IDNumDummy").prop("readonly", true);
                    $("#IDNumDum").val(response["IDNo"]);
                    $("#IDNumDum").prop("readonly", true);
                    $('#RegisterForm').hide();
                    $('#SendSMSDivFirst').show();



                }




            }


            else {
                $('#SendSMSDivFirst').hide();
                $('#SendSMSDivSecond').hide();
                myApp.alert('', 'رقم شخصي غير موجود!');
                $('#RegisterForm').clearForm();
            }




            $('.page_subtitle').hide();
            //   return false;

        }



    });



}


function ajaxSendSMSForm(theForm) {
    var $ = jQuery;
    $('#loader').fadeIn();
    var formData = $(theForm).serialize(),
note = $('#Note');
    $.ajax({
        type: "GET",
        url: "http://172.16.106.110/services/CustomerService.svc/SendSMS",
        data: formData,
        success: function (response) {



            if (response === true) {



                myApp.alert('', 'أرسلت الرسائل القصيرة بنجاح!');

                $('#SendSMSDivFirst').hide();
                $('#SendSMSDivSecond').show();



            }


            else {

                myApp.alert('', 'الرسائل القصيرة غير ناجحة!');

            }

            $('.page_subtitle').hide();
            //   return false;

        }


    });

}




function ajaxAuthSMSForm(theForm) {
    var $ = jQuery;
    $('#loader').fadeIn();
    var formData = $(theForm).serialize(),
note = $('#Note');
    $.ajax({
        type: "GET",
        url: "http://172.16.106.110/services/CustomerService.svc/AuthSMS",
        data: formData,
        success: function (response) {



            if (response["Status"] === 'SMScodeCORRECT') {



                myApp.alert('', 'كلمة المرور حفظ بنجاح!');

                $('#SendSMSDivFirst').hide();
                $('#SendSMSDivSecond').hide();
                $('#RegisterForm').show();
                $(".popup-signup").attr({ "style": "display:none" });

                myApp.closeModal(".popup-signup");

                //                $('.popup-login').removeAttr( "style" );
                //               
                //               myApp.popup('.popup-login');


            }


            else {
                if (response["Status"] === 'SMScodeINCORRECT') {

                    myApp.alert('', 'كود الرسائل القصيرة غير صحيحة!');
                }
                else if (response["Status"] === 'SMScodeCORRECT_PassSaveFailed') {
                    myApp.alert('', 'فشل توفير كلمة مرور!');
                }

            }

            $('.page_subtitle').hide();
            //   return false;

        }


    });

}


function ajaxCheckIDPass(theForm) {
    var $ = jQuery;
    $('#loader').fadeIn();
    var formData = $(theForm).serialize(),
note = $('#Note');
    $.ajax({
        type: "GET",
        url: "http://172.16.106.110/services/CustomerService.svc/ValidateIDMain",
        data: formData,
        success: function (response) {



            if (response["Status"] === 'success') {


                if ($.trim(response["Mobile"]).length == 0) {
                    myApp.alert('', 'رقم الجوال غير موجود!');
                    $('#ForPassDivFirst').hide();

                    myApp.closeModal(".popup.modal-in");
                }

                else if (response["User_Verified"] != 'Y') {
                    myApp.alert('', 'لا يتم التحقق من المستخدم!');
                    $('#ForPassDivFirst').hide();
                    myApp.closeModal(".popup-login");

                }

                else {
                    // myApp.alert('', 'كلمة السر ارسلت بنجاح!');
                    $('#ForPassForm').hide();
                    $("#mobile_noPassForm").val(response["Mobile"]);
                    $("#mobile_noPassForm").prop("readonly", true);
                    $("#IDNumPassForm").val(response["IDNo"]);
                    $("#IDNumPassForm").prop("readonly", true);
                    $('#ForPassDivFirst').show();




                }




            }


            else {
                $('#ForPassDivFirst').hide();

                myApp.alert('', 'رقم شخصي غير موجود!');
                $('#ForPassForm').clearForm();
            }




            $('.page_subtitle').hide();
            //   return false;

        }



    });

}

function ajaxSendPassword(theForm) {
    var $ = jQuery;
    $('#loader').fadeIn();
    var formData = $(theForm).serialize(),
note = $('#Note');
    $.ajax({
        type: "GET",
        url: "http://172.16.106.110/services/CustomerService.svc/SendPassword",
        data: formData,
        success: function (response) {



            if (response === true) {



                myApp.alert('', 'إرسال كلمة المرور بنجاح!');

                $('#ForPassDivFirst').hide();
                $('#ForPassForm').show();



            }


            else {

                myApp.alert('', 'فشلت إرسال كلمة المرور!');
                $('#ForPassDivFirst').hide();
                $('#ForPassForm').show();
            }

            $('.page_subtitle').hide();
            //   return false;

        }


    });

}

MaleFemale = { 1: "Male", 2: "Female" };
UserVerified = { 'Y': { 'text': 'Verified', 'icon': 'check_round' }, 'N': { 'text': 'Not Verified', 'icon': 'close_round'} };
UserType = { 'E': 'Employee', 'C': 'Beneficiary', 'U': 'Unknown' };
//load basic deatils async
function ajaxBasicDetails(content, url, next) {

    //if a valid id found in the query string then get user details from local storage
    var query = $$.parseUrlQuery(url);
    if (query && query.id) {
        var basicDetails = { userBasicDetails: '', userOtherDetails:''};
        var users = userlist.users()//get users from local storage
        if (users) {
            users.filter(function (val) {
                $$.each(val.value, function (index, value) {
                    if (value.rID === query.id) {
                        value.showUserVerified = true;
                        value.User_Verified = UserVerified[value.User_Verified ? value.User_Verified : 'N'];
                        value.UserType = UserType[value.UserType?value.UserType:'U'];
                        basicDetails.userBasicDetails = value;
                    }
                });
            });
        }
        // Template
        var template = Template7.compile(content);
        // Compile content template with received JSON data
        var resultContent = template(basicDetails);
        return next(resultContent);
    }

    //to get user details from server pass a valid token as form data to identify the user
    var formData = getToken();
    if (!formData) return 'Invalid token';
    $$.get(serviceLinks.GetBasicDetails, formData, function (data) {
        if (data) {
            var basicDetails = JSON.parse(data);
            if (basicDetails) {
                //if user name or mobile not retrieved then set user name and mobile from the session already stored 
                if (!basicDetails.userBasicDetails.Name || !basicDetails.userBasicDetails.Mobile) {
                    var userData = RetreiveData(true);
                    basicDetails.userBasicDetails.Name = userData.Name;
                    basicDetails.userBasicDetails.Mobile = userData.Mobile;
                }

                //calculate the user age
                if (basicDetails.userOtherDetails.DOB) {
                    var value = new Date(parseInt(basicDetails.userOtherDetails.DOB.replace(/(^.*\()|([+-].*$)/g, '')));
                    var now = new Date();
                    var diff = now.getFullYear() - value.getFullYear();
                    basicDetails.userOtherDetails.DOB = diff;
                }

                //change code value to text for user gender
                if (basicDetails.userOtherDetails.Sex) {
                    basicDetails.userOtherDetails.Sex = MaleFemale[basicDetails.userOtherDetails.Sex];
                }
                //set what to show
                basicDetails.userBasicDetails.showUserVerified = false;

                // Template
                var template = Template7.compile(content);
                // Compile content template with received JSON data
                var resultContent = template(basicDetails);
                // Now we call "next" callback function with result content
                next(resultContent);
            }
            else {
                myApp.alert('', 'User details not found');
            }
        }
        else {
            myApp.alert('', 'Invalid token');
        }
        //console.log(data);
    }, function (xhr, status) {
        console.log(xhr.responseText);
    });
    //------------------
}

//load help deatils async 
function ajaxHelpDetails(content, url, next) {
    //pass a valid token as form data to identify the user
    var formData = getToken();
    if (!formData) return 'Invalid token';
    $$.get(serviceLinks.GetLastMeetingDecision, formData, function (data) {
        if (data) {
            var helpDetails = JSON.parse(data);
            if (helpDetails) {

                //file null format =''
                if (helpDetails.FileNo == -1) {
                    helpDetails.FileNo = '';
                }

                //format the reg date to dd/mm/yyyy
                if (helpDetails.RegDate) {
                    var value = new Date(parseInt(helpDetails.RegDate.replace(/(^.*\()|([+-].*$)/g, '')));
                    helpDetails.RegDate = value.getDate() + "/" + value.getMonth() + "/" + value.getFullYear();
                }

                // Template
                var template = Template7.compile(content);
                // Compile content template with received JSON data
                var resultContent = template(helpDetails);
                // Now we call "next" callback function with result content
                next(resultContent);
            }
            else {
                myApp.alert('', 'Help details not found');
            }
        }
        else {
            myApp.alert('', 'Invalid token');
        }
        //console.log(data);
    }, function (xhr, status) {
        console.log(xhr.responseText);
    });
    //------------------
}

$.fn.clearForm = function () {
    return this.each(function () {
        var type = this.type, tag = this.tagName.toLowerCase();
        if (tag == 'form')
            return $(':input', this).clearForm();
        if (type == 'text' || type == 'password' || tag == 'textarea')
            this.value = '';
        //        else if (type == 'checkbox' || type == 'radio')
        //            this.checked = false;
        else if (tag == 'select')
            this.selectedIndex = -1;
    });
};

//get token for the current user 
function getToken() {
    var userData = RetreiveData(true);
    var token = { token: userData.token };
    return token;

}

//true for local storage retrieval
function RetreiveData(ls) {
    if (typeof (Storage) !== "undefined") {
        if (ls) return myApp.formGetData('form-UserInfo')
        else return sessionStorage.getItem('form-UserInfo');
    } else {
        return '';
    }
};

//store data 
function storeData(data) {
    if (typeof (Storage) !== "undefined") {
        //session storage
        sessionStorage.setItem('form-UserInfo', data);
        //app object storage
        myApp.formStoreData('form-UserInfo', data);
    } else {
        myApp.alert('', 'Sorry, your browser does not support web storage...');
    }
};
//change lang
function changLang() {
    myApp.ls.setItem("zakLangOption", $$(this).data('lang'));
    location.reload(true);
};

//log out
function LogOut() {
    userLoggedIn = '';
    storeData('');
    parseUserInfoData('');
};

//all the basic bindings of the index page
var bindings = [{
    element: '#LoginForm',
    handler: ajaxLogIn
}, {
    element: '#RegisterForm',
    handler: ajaxRegister
}, {
    element: '#SendSMSForm',
    handler: ajaxSendSMSForm
}, {
    element: '#AuthSMSForm',
    handler: ajaxAuthSMSForm
}, {
    element: '#ForPassForm',
    handler: ajaxCheckIDPass
}, {
    element: '#SendSMSPassForm',
    handler: ajaxSendPassword
}, {
    element: '.changLang',
    event: 'click',
    handler: changLang
}, {
    element: '.Logout',
    event: 'click',
    handler: LogOut
}];

//binding utility function
function bindEvents(bindings) {
    for (var i in bindings) {
        if (bindings[i].event) {
            $(bindings[i].element).on(bindings[i].event, bindings[i].handler);
        }
        else {
            (function (binding) {
                $(binding.element).validate({
                    submitHandler: function (form) {
                        binding.handler(form);
                        return false;
                    }
                });
            })(bindings[i])
        }
    }
}

function ParseJsonString(str) {
    var json;
    try {
        json = JSON.parse(str);
    } catch (err) {
        console.log(err.message)    
    }
    return json;
}