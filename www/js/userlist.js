userlist = {
    users: function loadUserLits(callback) {
        var f7Users = myApp.ls.getItem("f7Users");
        if (f7Users) {
            var users = JSON.parse(JSON.parse(f7Users));
            if (callback) callback();
            return users;
        }
        userlist.tempStorage(callback);
    },
    ReLoadUsers: function () {
        myApp.ls.setItem("f7Users", "");
        userlist.init();
    },
    init: function init() {
        var users = userlist.users(function () { userlist.init(); })
        if (users) {
            var ListView = myApp.virtualList('.list-block.virtual-list', {
                items: users,
                template: Template7.templates.UserListItem,
                ul: $('.list-block.virtual-list'),
                // search all items, we need to return array with indexes of matched items
                searchAll: function (query, items) {
                    var grpItems = [];
                    for (var i = 0; i < items.length; i++) {
                        var foundItems = [];
                        for (var j = 0; j < items[i].value.length; j++) {
                            if (items[i].value[j].Name.indexOf(query.trim()) >= 0) {
                                foundItems.push(items[i].value[j]);
                            }
                        }
                        if (foundItems.length > 0) {
                            items[i].value = foundItems;
                            grpItems.push(items[i]);
                        }
                    }
                    return grpItems;
                }
            });
            // Filter
            ListView.filterItems = function (indexes, resetScrollTop) {
                ListView.filteredItems = [];
                //var firstIndex = indexes[0];
                //var lastIndex = indexes[indexes.length - 1];
                for (var i = 0; i < indexes.length; i++) {
                    ListView.filteredItems.push(indexes[i]);
                }
                if (typeof resetScrollTop === 'undefined') resetScrollTop = true;
                if (resetScrollTop) {
                    ListView.pageContent[0].scrollTop = 0;
                }
                ListView.clearCache();
                ListView.update();
            };
            ListView.resetFilter = function () {
                if (ListView.params.showFilteredItemsOnly) {
                    ListView.filteredItems = [];
                }
                else {
                    ListView.filteredItems = null;
                    delete ListView.filteredItems;
                }
                ListView.items = users;
                ListView.update();
            };
        }
    },

    tempStorage: function tempInitializeStorage(callback) {
        var postdata = { action_sub: 'GetUsers' };
        $$.post(serviceLinks.TktService, $$.serializeObject(postdata), function (data) {
            myApp.ls.setItem("f7Users", JSON.stringify(data));
            callback();
            //console.log(data);
        }, function (xhr, status) {
            console.log(xhr.responseText);
        });
        return '';
    }
};
