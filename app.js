var budgetController = (function(){
    
    var Expence = function(id,description,value){
        this.id=id;  
        this.description=description;    
        this.value=value;
        this.percentage= -1;
    };

    Expence.prototype.calculatePercentage = function(netIncome) {
        if (netIncome > 0) {
            this.percentage = Math.round((this.value / netIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expence.prototype.getPercentage = function() {
       
        return this.percentage;
        
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },

        totals:{
            exp:0,
            inc:0
        },

        budget: 0,
        
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].map(item=>{
            sum += item.value;
        });

        data.totals[type] = sum;
    };

    return {
        allItem: function(type,description,value){
            var newItem,ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(type === "exp"){
                newItem = new Expence(ID,description,value);
            } else if(type==="inc"){
                newItem = new Income(ID,description,value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem : function(type,id){
            var ids, index;

            ids = data.allItems[type].map(current=>{
                return current.id;
            });

            //console.log(ids);

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){

            calculateTotal('exp');

            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage= -1;
            }
             
        },

        calPercentage: () =>{
            
            data.allItems.exp.map(item=>{
                item.calculatePercentage(data.totals.inc);
            });
        },

        getPercentages : ()=>{
            var allpercentage = data.allItems.exp.map(item=>{
                return item.getPercentage();
            });

            return allpercentage;
        },

        getBudget: function(){
            return{
                budget:data.budget,
                totalincome: data.totals.inc,
                totalexpense: data.totals.exp,
                percentage:data.percentage
            }
        },

        testing : function(){
            console.log(data);
        }
    }

})();






var UIController = (function(){

    var DomString = {
        inputType : ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputButton: ".add__btn",
        income:".income__list",
        expenses:".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentage : ".item__percentage",
        Month: ".budget__title--month"
    };

    var formatNumber = function(num,type) {

        var numsplit,int,dec,type,sign;

        num = Math.abs(num);

        num = num.toFixed(2);

        numsplit = num.split(".");

        int = numsplit[0];

        if(int.length>3){
            int = int.substr(0,int.length-3)+","+int.substr(int.length-3,3);
        }   

        dec = numsplit[1];
        if(type==="exp"){
            sign="-"
        } else{
            sign="+"
        }

        return sign+ " " +int+"."+dec;

    };

    var nodeListForEach = (list, callback) => {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput:function(){
            return{
                type:document.querySelector(DomString.inputType).value,
                description:document.querySelector(DomString.inputDescription).value,
                value:parseFloat(document.querySelector(DomString.inputValue).value)
            }
        },

        addListItem: function(obj,type){
            var html,newHtml,element;

            if(type ==="inc"){
                element= DomString.income;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type=== "exp"){
                element= DomString.expenses;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
        },
        
        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(`${DomString.inputDescription},${DomString.inputValue}`);

            fieldsArr =Array.prototype.slice.call(fields);

            fieldsArr.map(item=>{
                item.value="";
            })

            fieldsArr[0].focus();
        },

        deleteListItem : function(ID){
            var element = document.getElementById(ID);

            element.parentNode.removeChild(element);

        },

        displayBudget: function(obj){

            var type;

            obj.budget >=0 ? type ="inc" :type ="exp";

            document.querySelector(DomString.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DomString.incomeLabel).textContent=formatNumber(obj.totalincome,"inc");
            document.querySelector(DomString.expensesLabel).textContent=formatNumber(obj.totalexpense,"exp");
            
            if(obj.percentage > 0){
                document.querySelector(DomString.percentageLabel).textContent = `${obj.percentage}%`;
            } else{
                document.querySelector(DomString.percentageLabel).textContent = "---";
            }
        },

        displayexpPercentage : percentage=>{

            var fields = document.querySelectorAll(DomString.expensesPercentage);

            nodeListForEach(fields,(current,index)=>{
                if(percentage[index] >0){
                    current.textContent = percentage[index] + "%" ;
                } else{
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function(){

            var month,now,months,year;

            now = new Date();

            months =["January","February","March","April","May","June","July","August","September","October","November","December"];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DomString.Month).textContent = months[month] + " " + year;

        },

        changedType: function(){

            var fields = document.querySelectorAll(DomString.inputType+","+DomString.inputDescription+","+DomString.inputValue);

            nodeListForEach(fields, function(current){
                current.classList.toggle("red-focus");
            });

            document.querySelector(DomString.inputButton).classList.toggle("red");
        },
        
        getDomString:function(){
            return DomString;
        }
    }    

})();






var Controller = (function(budgetControl,UIControl){

    var setupEventListeners = function(){

        var Dom = UIControl.getDomString();

        document.querySelector(Dom.inputButton).addEventListener("click", control);

        document.addEventListener("keypress", event => {
            if (event.keyCode === 13 || event.which === 13) {
                control();
            }
        });

        document.querySelector(Dom.container).addEventListener("click",DeleteItem);

        document.querySelector(Dom.inputType).addEventListener("change",UIControl.changedType);
        
    };

    var updateBudget = function(){

        budgetControl.calculateBudget();
        
        var budget = budgetControl.getBudget();
        
        UIControl.displayBudget(budget);

        //console.log(budget);
    };

    var updatePercentage = function(){

        budgetControl.calPercentage();

        var percentage = budgetControl.getPercentages();

        UIControl.displayexpPercentage(percentage);
    }

    var control = function () {

        var input = UIControl.getInput();

        if(input.description!=="" && !isNaN(input.value) && input.value>0){
            
            var newitem = budgetControl.allItem(input.type, input.description, input.value);

            UIControl.addListItem(newitem, input.type);

            UIControl.clearFields();
            
            updateBudget();

            updatePercentage();

        }
        
        //console.log(newitem);

        //console.log("It's works");
    };

    var DeleteItem = function(event) {
        var itemId, splitId, type ,ID ;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //console.log(itemId);

        splitId = itemId.split("-");

        type = splitId[0];

        ID = parseInt(splitId[1]);

        //console.log(splitId,type,ID)

        budgetControl.deleteItem(type,ID);

        UIControl.deleteListItem(itemId);

        updateBudget();

        updatePercentage();

    } 

    return {
        init : function(){
            
            console.log("Application has started.");

            UIControl.displayMonth();

            setupEventListeners();
        }
    }
    
    
})(budgetController,UIController)


Controller.init();