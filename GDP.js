//Reading the csv file for getting country and its continent data.
var fs = require('fs'),
        gdpGniData=[],
        countriesMap ={},
        contAggMap={},
        continentAggList=[];
fs.readFile('country-continent-nm.csv', 'utf8', function (error, data) {
  if (error) throw error;
    var tempData = data.split('\r\n');
    var headers = tempData[0].split(',');
     for (var i = 1; i < tempData.length; i++) {
       var contData = tempData[i].split(',');
       countriesMap[contData[0]]=contData[1];
     }
});

//Reading the main csv file using line by line code
var heading=[],
    tempData=[],
    atMarketData=[],
    perCapitaData=[],
    yrValue1,
    gdpGrowthAnnual=[];
    count=0;
function processFile(inputFile) {
    var fs = require('fs'),
        readline = require('readline'),
        instream = fs.createReadStream(inputFile),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);

    rl.on('line', function (line) {
        var result = line.split(",");
        if(result[0] == 'Country Name'){
          heading =result;
          CountryHeader(heading);
        }else if (result[0] == 'India' && result[3] == 'NY.GDP.MKTP.KD.ZG') {
          gdpGrowth(heading,result);
        } else if (result[3] =='NY.GDP.PCAP.KD' && result[0] in countriesMap) {
          processAggregate(heading,result);
        }
        if(result[3]!=null){
          atMarketFun(result,'NY.GDP.MKTP.KD','NY.GNP.MKTP.KD');
        }
        if(result[2]!=null){
          perCapitaFun(result,'NY.GDP.PCAP.KD','NY.GNP.PCAP.KD');
        }
      });

    rl.on('close', function (line) {
      postProcessingAgg();
        fs.writeFile('json/india_exse.json',JSON.stringify(gdpGrowthAnnual),function(err){
          if (err) {console.log(err);
          }else {
            console.log('Sucessfully done');
          }
      });
      fs.writeFile('json/Continent.json',JSON.stringify(continentAggList),function(err){
      });
      atMarketData.sort(function(a,b){
        return  b["gdp"] - a["gdp"];
      })
      fs.writeFile('json/market.json',JSON.stringify(atMarketData.slice(0,15)),function(err){
      });

      perCapitaData.sort(function(a,b){
        return b["gdp"] - a["gdp"];
      })
      fs.writeFile('json/capita.json',JSON.stringify(perCapitaData.slice(0,15)),function(err){
      });
      console.log('done reading file.');
    });
     }
processFile('WDI_Data.csv');

function gdpGrowth(headingArray,resultData) {
for (var i = 4; i < headingArray.length; i++) {
  if (resultData[i]=="") {
      yrValue1 ='0';
  }else {
    yrValue1=resultData[i];
  }
  var data ={
    key:headingArray[i],
    value:parseFloat(yrValue1)
  }
  gdpGrowthAnnual.push(data);
 }
}

//Thrid Question
function processAggregate(headingArray,inputArray){
  for (var i = 4; i < headingArray.length; i++) {
  var yrData=0;

  if(inputArray[i+1]!="" && inputArray[i+1]!=null && inputArray[i+1]!=undefined){
    yrData=inputArray[i+1];
    // console.log(yrData);
  }

  var tempContMap={};
  tempContMap=contAggMap[headingArray[i]];
  tempContMap[countriesMap[inputArray[0]]]=parseFloat(tempContMap[countriesMap[inputArray[0]]])+parseFloat(yrData);
  contAggMap[headingArray[i]]=tempContMap;
}

}
function CountryHeader(headingArray){
  for (var i = 4; i < headingArray.length; i++) {
    var tempContMap={
      "key":parseInt(headingArray[i]),
      "EU":0,
      "AS":0,
      "NA":0,
      "AF":0,
      "SA":0,
      "OC":0
    }
  contAggMap[headingArray[i]]=tempContMap;
  }
}
function postProcessingAgg(){
  var mapKeys= Object.keys(contAggMap);
  var continentList=['EU','AS','NA','AF','SA','OC'];
  for (var i = 0; i < mapKeys.length; i++) {
    continentAggList.push(contAggMap[mapKeys[i]]);
}
}

var flag1=false,
    flag2=false;
var gdp1,gni1;
function atMarketFun(fileInputArray,gdpValue1,gniValue2) {
  for (var i = 0; i < fileInputArray.length; i++) {
    var temp =fileInputArray[0];
    if(fileInputArray[3] == gdpValue1) {
      gdp1=fileInputArray[49];
      flag1=true;
    }

    if(fileInputArray[3] == gniValue2 && flag1==true) {
      gni1=fileInputArray[49];
      count++;

      var  obj= new Object;
      obj.key=temp;
      obj.gdp=parseFloat(gdp1);
      obj.gni=parseFloat(gni1);
      // console.log(obj);
      atMarketData.push(obj);
      flag1=false;
    }
  }
  return atMarketData;
}

var gdp2,gni2;
function perCapitaFun(fileInputArray,gdpValue1,gniValue2) {
  for (var i = 0; i < fileInputArray.length; i++) {
    var temp =fileInputArray[0];
    if(fileInputArray[3] == gdpValue1) {
      gdp2=fileInputArray[49];
      flag2=true;
    }
    if(fileInputArray[3] == gniValue2 && flag2 == true) {
      gni2=fileInputArray[49];
      count++;
      console.log("count"+ " " + count);
      var  obj1= new Object;
      obj1.key=temp;
      obj1.gdp=parseFloat(gdp2);
      obj1.gni=parseFloat(gni2);
      perCapitaData.push(obj1);
      flag2=false;
    }
  }
  return perCapitaData;
}
