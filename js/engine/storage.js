/*
 * storage.js
 * Saved data: LocalStorage wrapper (bonuses unlocked, settings, mixes) and LocalMixObject.
 */

function CloudSync() {
    this.sync = function (e) {
        notnull(e);
    };
    this.save = nada;
    this.remove = nada;
    return this;
}
function LocalStorage() {
    var e = this;
    this.setItem = function (e, o, t) {
        window.localStorage.setItem(e, o);
        if (t) {
            cloud.save(e, o);
        }
    };
    this.getItem = function (e) {
        return window.localStorage.getItem(e);
    };
    this.getAllItem = function () {
        return window.localStorage;
    };
    this.removeItem = function (e, o) {
        window.localStorage.removeItem(e);
        if (o) {
            cloud.remove(e);
        }
    };
    this.clear = function () {
        window.localStorage.clear();
    };
    this.weight = function () {
        var e;
        var o;
        var t = window.localStorage;
        var n = 0;
        var i = "LS | --------------------------\n";
        for (o in t) {
            n += e = (t[o].length + o.length) * 2;
            i += "LS | " + o.substr(0, 50) + " = " + (e / 1024).toFixed(2) + " KB\n";
        }
        return i + "LS | Total = " + (n / 1024).toFixed(2) + " KB\nLS | --------------------------";
    };
    this.restoreMixFromDB = function (o) {
        var t = {};
        t.uuid = getListUUID();
        t.guid = getUserInfo().guid;
        t.mixids = localMixObject.getAllMixId();
        var n = o || nada;
        if (hasNetwork && (t.uuid.length || t.user.guid || t.mixids.length)) {
            $.ajax({
                type: "POST",
                url: domainOnline + "ph3/get-all-mix-db.php",
                data: t,
                dataType: "json",
                crossdomain: true,
                success: function (o) {
                    if (o.state == "success") {
                        o.mixlist.forEach(function (e) {
                            e.synced = true;
                            e.online = true;
                            e.mymix = true;
                            localMixObject.saveMix(e);
                            if (localMixObject.getMix("fav-" + e.link)) {
                                localMixObject.saveMix(e, true);
                            }
                        });
                        localMixObject.getAllMix().forEach(function (o) {
                            if (o.mymix && o.online && !o.synced) {
                                e.removeItem("mix-" + o.link);
                                e.removeItem("fav-" + o.link);
                            }
                        });
                        getListUUID().forEach(function (t) {
                            if (!(t.toUpperCase() == machine.uuid.toUpperCase() || existInArray(o.uuidlist, t, false))) {
                                e.removeItem("uuid-" + t, true);
                            }
                        });
                        o.uuidlist.forEach(function (o) {
                            e.setItem("uuid-" + o.toUpperCase(), "", true);
                        });
                        n({
                            msg: "ok",
                            nb: o.mixlist.length
                        });
                    } else {
                        n({
                            msg: "bug"
                        });
                    }
                },
                error: function (e) {
                    n({
                        msg: "error"
                    });
                }
            });
        }
    };
    return this;
}
function LocalMixObject() {
    var e = this;
    this.validateMix = function (mix) {
        return mix &&
            mix.id &&
            mix.date &&
            mix.data &&
            Array.isArray(mix.data);
    };
    this.saveMix = function (i, j) {
        var k;
        var j = !!(j != null && j !== "undefined") && j;
        return !!(i != null && i !== "undefined") && (k = i.link.indexOf("mix-") == -1 ? "mix-" + i.link : i.link, k = j ? k.replace("mix-", "fav-") : k, j = i == null || i === "undefined" ? null : JSON.stringify(i), storage.setItem(k, j), true);
    };
    this.deleteMix = function (e) {
        return !!notnull(storage.getItem(e)) && (storage.removeItem(e, true), true);
    };
    this.deleteMixById = function (o) {
        var t;
        var n = e.getAllMix(true);
        var i = e.getAllMix(true, true);
        for (t in n) {
            if (n[t].id == o) {
                e.deleteMix("mix-" + n[t].link);
                e.deleteMix("fav-" + n[t].link);
            }
        }
        for (t in i) {
            if (i[t].id == o) {
                e.deleteMix("fav-" + i[t].link);
                e.deleteMix("mix-" + i[t].link);
            }
        }
    };
    this.getMix = function (e) {
        return !!notnull(storage.getItem(e)) && jsonDecode(storage.getItem(e));
    };
    this.getAllMix = function (j, k) {
        var l;
        var m;
        var p = !!(j != null && j !== "undefined") && j;
        var j = !!(k != null && k !== "undefined") && k;
        var q = [];
        var u = storage.getAllItem();
        var v = j ? "fav-" : "mix-";
        for (l in u) {
            if (l.indexOf(v) != -1) {
                if ((m = jsonDecode(u[l])).datedb == null || (m = jsonDecode(u[l])).datedb === "undefined") {
                    m.datedb = m.date != null && m.date !== "undefined" ? m.date : getDateNow();
                }
                if (!(p && l.indexOf("v" + app.version) == -1 && l.indexOf("-IOSV" + app.version) == -1)) {
                    q.push(m);
                }
            }
        }
        return q;
    };
    this.saveMixOffline = function () {
        var o;
        var t = e.getAllMix();
        for (o in t) {
            var n = t[o];
            if (!n.online && n.mymix) {
                saveMixDB(n);
            }
        }
    };
    this.getAllMixId = function () {
        var o;
        var t = e.getAllMix(false);
        var n = [];
        for (o in t) {
            var i = t[o];
            if (i.id) {
                n.push(parseInt(i.id));
            }
        }
        return n;
    };
    this.getMixlist = function () {
        var o = e.getAllMix(true, false);
        return e.sortArrayMix(o);
    };
    this.getFavlist = function () {
        var o = e.getAllMix(true, true);
        return e.sortArrayMix(o);
    };
    this.sortArrayMix = function (e, o) {
        e.sort(function (e, o) {
            if (o.datedb > e.datedb) {
                return 1;
            } else if (o.datedb < e.datedb) {
                return -1;
            } else {
                return 0;
            }
        });
        if (o === true) {
            return e.reverse();
        } else {
            return e;
        }
    };
    this.getLastMix = function () {
        var o = e.getAllMix(false);
        var t = o.length;
        if (t > 0) {
            return o[t - 1];
        } else {
            return null;
        }
    };
    this.getLastDjName = function () {
        var o = e.getLastMix();
        if (notnull(o)) {
            return o.name;
        } else {
            return "";
        }
    };
    this.deleteAllMix = function () {
        for (var e in storage.getAllItem()) {
            if (!(e.indexOf("mix-") == -1 && e.indexOf("fav-") == -1)) {
                storage.removeItem(e);
            }
        }
    };
    this.getStatMixOnline = function (o) {
        var t = e.getAllMixId();
        if (t.length) {
            xhr("GET", domainOnline + "ph3/get-stat-mix.php", {
                id: t
            }, function (n) {
                if (n.state == "success") {
                    XHRmemotime.mymix = new Date();
                    n = n.list;
                    var i = [];
                    n.forEach(function (o) {
                        i.push(parseInt(o.id));
                        var t = e.getMix("mix-" + o.link);
                        t.id = o.id;
                        t.newnbview = o.nbview;
                        t.newnblike = o.nblike;
                        e.saveMix(t);
                    });
                    if (i.length < t.length) {
                        var a;
                        n = uniqueBetweenArray(i, t);
                        for (a of n) {
                            e.deleteMixById(a);
                        }
                    }
                    if (o !== undefined) {
                        o();
                    }
                }
            }, function (e) { });
        } else if (o !== undefined) {
            o();
        }
    };
    this.getStatFavOnline = function (o) {
        var t = e.getFavlist();
        var n = [];
        t.forEach(function (e) {
            if (!(e.mymix && !e.online || !notnull(e.id))) {
                n.push(parseInt(e.id));
            }
        });
        if (n.length) {
            xhr("GET", domainOnline + "ph3/get-stat-mix.php", {
                id: n
            }, function (t) {
                if (t.state == "success") {
                    XHRmemotime.myfav = new Date();
                    t = t.list;
                    var i = [];
                    t.forEach(function (o) {
                        i.push(parseInt(o.id));
                        var t = e.getMix("fav-" + o.link);
                        t.id = o.id;
                        t.nbview = o.nbview;
                        t.nblike = o.nblike;
                        e.saveMix(t, true);
                    });
                    if (i.length < n.length) {
                        var a;
                        t = uniqueBetweenArray(i, n);
                        for (a of t) {
                            e.deleteMixById(a);
                        }
                    }
                    if (o !== undefined) {
                        o();
                    }
                }
            }, function (e) { });
        } else if (o !== undefined) {
            o();
        }
    };
}
