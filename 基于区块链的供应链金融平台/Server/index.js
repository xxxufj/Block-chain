const path = require('path')
const Configuration = require('../nodejs-sdk/packages/api/common/configuration').Configuration
Configuration.setConfig(path.join(__dirname, './conf/config.json'));
const { Web3jService, ConsensusService, SystemConfigService } = require('../nodejs-sdk/packages/api/web3j')
const web3jService = new Web3jService();
const express = require('express')
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
const fs = require('fs');
const utils = require('../nodejs-sdk/packages/api/common/utils');
const {getAbi } = require('../nodejs-sdk/packages/cli/interfaces/base');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const ContractName = "supply";
const ContractAddress = "0xd0919442a9680f1957a9713af040af68680e911f";
const abi = getAbi(ContractName);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 

var crypto = require('crypto')

var company_address;
var company_name;

var ejs = require("ejs");
app.set("views","./views");
app.engine("html",ejs.__express);
app.set("view engine","html");


function getMD5Password(content) {
    var md5 = crypto.createHash('md5');//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    md5.update(content);
    var d = md5.digest('hex');  //加密后的值d
  return d;
}


app.get('/register', urlencodedParser, function (req, res) {
    console.log("register");
    res.render("register.html");
})

app.get('/signin', urlencodedParser, function (req, res) {
console.log("signin");
    res.render('login.html', {
        errorInfo:''
    })
})

app.get('/signin/register.html', urlencodedParser, function (req, res) {
    res.redirect('/register');
})

app.get('/register/signin.html', urlencodedParser, function (req, res) {
    res.redirect('/signin');
})

app.get('/home.html', urlencodedParser, function (req, res) {
    argv = {
        functionName : "get_user",
        parameters :  [company_address]
    };
    call(argv).then(result => {
        var info = result.output;
        var balance = info[1];
        var credit = info[2];
        res.render("home.html", {        
            cur_company_name:company_name,
            cur_company_addr:company_address,
            company_name:company_name,
            company_addr:company_address,
            balance:balance,
            credit:credit
        });
    });
})

app.post('/home.html', urlencodedParser, function (req, res) {
    addr = req.body.addr;
    argv = {
        functionName : "get_user",
        parameters :  [addr]
    };
    call(argv).then(result => {
        var info = result.output;
        var name = info[0];
        var balance = info[1];
        var credit = info[2];
        res.render("home.html", {  
            company_addr:company_address,
            company_name:company_name,      
            cur_company_name:name,
            cur_company_addr:addr,
            balance:balance,
            credit:credit
        });
    });
})


app.get('/signin.html', urlencodedParser, function (req, res) {
    res.redirect('/signin');
})

app.get('/register.html', urlencodedParser, function (req, res) {
    res.redirect('/register');
})

var chains = [];
app.get('/supplyChain.html', urlencodedParser, function (req, res) {
    chains = [];
    page = 0;
    argv1 = {
        functionName : "get_reciept_chain_len",
        parameters :  []
    };
    call(argv1).then(result1 => {
        chain_len = Number(result1.output[0]);
        if(chain_len == 0){
            var ret = {};
            ret.company_name = company_name;
            ret.company_addr = company_address;
            ret.items = [];
            ret.page = 0;
            ret.status = 'Undetermined';
            res.render(
                "supplyChain",ret
            );
        }
        for (var i = 0; i < chain_len; i++){
            (function(i){
                argv2 = {
                    functionName : "get_reciepts_len",
                    parameters :  [i]
                };

            call(argv2).then(result2 => {
                reciepts_num = Number(result2.output[0]);
                chains.push(new Reciept_chain());
                for(var j = 0; j < reciepts_num; j++){
                    (function(j){
                    argv3 = {
                        functionName : "get_reciept",
                        parameters :  [i, j]
                    };
                    call(argv3).then(result3 => {
                        output=result3.output;
                        r = new Reciept(output[0],output[1],output[2],output[3],output[4],output[5],output[6]);
                        chains[i].reciepts.push(r);
                        if(j == reciepts_num - 1 && i == chain_len - 1){   
                            var ret = {};
                            ret.company_name = company_name;
                            ret.company_addr = company_address;
                            ret.items = chains[0].reciepts;
                            ret.page = 0;
                            argv4 = {
                                functionName : "get_chain_status",
                                parameters :  [0]
                            };
                            call(argv4).then(result => {
                                status = result.output[0];
                                status = (status == false)?'unpaid' : 'paid';
                                ret.status = status;
                                res.render(
                                    "supplyChain",ret
                                )
                            });               
                        }
                    });
                })(j)
                }
            })
        })(i)
    }})
})

var page = 0;
app.post('/supplyChain', urlencodedParser, function (req, res) {
    if(req.body.method == "next")page++;
    else page--;

    var ret = {};
    ret.company_name = company_name;
    ret.company_addr = company_address;
    if(ret<0)ret = 0;
    if(page>=chains.length)page = chains.length - 1;
    ret.items = chains[page].reciepts;
    ret.page = page;
    ret.status = 'Undetermined';
    argv = {
        functionName : "get_chain_status",
        parameters :  [page]
    };
    call(argv).then(result => {
        status = result.output[0];
        status = (status == false)?'unpaid' : 'paid';
        ret.status = status;
        res.render(
            "supplyChain",ret
        )
    });   
})

app.get('/newAccount.html', urlencodedParser, function (req, res) {
    res.render("newAccount.html", {        
        company_name:company_name,
    });
})

app.get('/transferAccount.html', urlencodedParser, function (req, res) {
    res.render("transferAccount.html", {        
        company_name:company_name,
    });
})

app.get('/finance.html', urlencodedParser, function (req, res) {
    res.render("finance.html", {        
        company_name:company_name,
    });
})

app.get('/payAccount.html', urlencodedParser, function (req, res) {
    res.render("payAccount.html", {        
        company_name:company_name,
    });
})


app.post('/signin', urlencodedParser, function (req, res) {
    key = getMD5Password(req.body.key);
    argv = {
        functionName : "company_signin",
        parameters : [req.body.addr, key]
    };
    call(argv).then(result => {
        res.status(200);
        if(result.output[2]==true){
            company_address = req.body.addr;
            argv2 = {
                functionName : "get_user",
                parameters :  [company_address]
            };
            call(argv2).then(result => {
                company_name = result.output[0];
                res.redirect('/home.html');
            });
        }
        else {
            res.render('login.html', {
                errorInfo:'公司地址与密码不匹配！'
            })
        }
    }).catch((e) => {
        console.log(e);
        res.render('login.html', {
            errorInfo:'请输入正确的公司地址和密码！'
        })
    })
})


app.post('/register', urlencodedParser, function (req, res) {
    company_address = req.body.addr;
    company_name = req.body.name;
    key = getMD5Password(req.body.key);
    argv = {
        functionName : "company_register",
        parameters : [req.body.addr, key, req.body.name, req.body.balance, req.body.credit]
    };
    call(argv).then(result => {
        res.status(200);
        res.redirect('/home.html');
    });
})


app.post('/issue_account', urlencodedParser, function (req, res) {
	console.log("issue_account test");
	console.log(req.body);
    argv = {
        functionName : "issue_account",
        parameters : [req.body.buyer, req.body.solder, req.body.goods, req.body.price, req.body.due_time]
    };
    call(argv).then(result => {
        res.status(200);
    });
    

})


app.post('/account_transfer', urlencodedParser, function (req, res) {
    console.log('account_transfer');
	console.log(req.body);
    argv = {
        functionName : "account_transfer",
        parameters : [req.body.prev_buyer, req.body.buyer, req.body.solder, req.body.goods, req.body.price, req.body.due_time]
    };
    call(argv).then(result => {
        res.status(200);
    });
})


app.post('/financing', urlencodedParser, function (req, res) {
    argv = {
        functionName : "financing",
        parameters : [req.body.bank, req.body.company, req.body.arrear_party, req.body.money, req.body.due_time]
    };
    call(argv).then(result => {
        res.status(200);
    });
})

app.post('/payoff', urlencodedParser, function (req, res) {
    argv = {
        functionName : "payoff",
        parameters :  [req.body.company]
    };
    call(argv).then(result => {
        res.status(200);
    });
})


class Reciept{
    constructor(buyer, solder, issue_time, due_time, good, price, transferd){
        this.buyer=buyer;
        this.solder=solder;
        this.issue_time=issue_time;
        this.due_time=due_time;
        this.good=good;
        this.price=price;
        this.transferd=transferd;
    }
};

class Reciept_chain{
    constructor(){
        this.paid = false;
        this.reciepts = [];
    }
}



app.get('/companies_info', urlencodedParser, function (req, res) {
    argv1 = {
        functionName : "get_addrs",
        parameters :  []
    };
    call(argv1).then(result1 => {
        res.status(200);
        argv2 = {
            functionName : "get_names",
            parameters :  []
        };
        call(argv2).then(result2 => {
            res.json({
                addrs:result1,
                names:result2
            })
        });
    });
})


app.get('/get_addrs', urlencodedParser, function (req, res) {
    argv = {
        functionName : "get_addrs",
        parameters :  []
    };
    call(argv).then(result => {
        res.status(200);
        res.json({
            addrs:result
        })
    });
})

app.get('/get_names', urlencodedParser, function (req, res) {
    argv = {
        functionName : "get_names",
        parameters :  []
    };
    call(argv).then(result => {
        res.status(200);
        res.json({
            names:result
        })
    });
})



function call(argv){
        contractName = ContractName;
        contractAddress = ContractAddress;
        functionName = argv.functionName;
        parameters = argv.parameters;

        for (let item of abi) {
            if (item.name === functionName && item.type === 'function') {
                if (item.inputs.length !== parameters.length) {
                    throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
                }

                functionName = utils.spliceFunctionSignature(item);
                if (item.constant) {
                    return web3jService.call(contractAddress, functionName, parameters).then(result => {
                        let status = result.result.status;
                        let ret = {
                            status: status
                        };
                        let output = result.result.output;
                        if (output !== '0x') {
                            ret.output = utils.decodeMethod(item, output);
                        }
                        return ret;
                    });
                } else {
                    return web3jService.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                        let txHash = result.transactionHash;
                        let status = result.status;
                        let ret = {
                            transactionHash: txHash,
                            status: status
                        };
                        let output = result.output;
                        if (output !== '0x') {
                            ret.output = utils.decodeMethod(item, output);
                        }
                        return ret;
                    });
                }
            }
        }

        throw new Error(`no function named as \`${functionName}\` in contract \`${contractName}\``);
    }

app.listen(8080);
