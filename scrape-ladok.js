// ==UserScript==
// @name        ladokpartlistmonkey
// @namespace   rick
// @include     https://www.start.ladok.se/gui*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version     0.1
// @grant    		none
// ==/UserScript==

// ------------------------------------------------------------------------------------------------------------
// -----------------=============######## Scrape participants from LADOK  ########=============----------------
// ------------------------------------------------------------------------------------------------------------
//  Copyright a97marbr / HGustavs / Zaxmy
//
//        (\ /)
//        (. .)           
//       c(")(")  ∴ 
//-------------------------------------------------------------------------------------------------------------

// Note: In order to comply with the GPL3 License you must publish any code based on this code using the GPL3 license. No exceptions.
// Note: For Now, we strongly advise that you manually confirm that the scraped results is correct

// Usage: 
// 
//   NB! This script is used in tandem with 'partlistmonkey'
//
//   1. In LADOK, navigate to the course you need a participant list
//   2. Make sure you show all participants, e.g, check "Visa från alla i denna version" and increase number of visable students to 400
//   3. Click "scrape" and copy the content in textview
//   4. Navigate to personal.his.se and the corresponding course
//   5. Paste the content from step 3 in the textview labled From LADOK.
//   6. Click "scrape" and get your complete participants list

'use strict';
var students;

function getpart(){
  let headings=[];

  var partheadtable=$("#resultatlistaDiv table thead tr").each(function(){
    $(this).find("th").each(function(){
      headings.push(this.innerText.trim());
    })
  });
  var parttable=$("#resultatlistaDiv table tbody tr").each(function(){
    let ssn="";
    $(this).find("td").each(function(idx){
      if(idx===0){
        ssn=this.innerText.trim();
        students[ssn]={};
      }else{
        students[ssn][headings[idx]]=this.innerText.trim();
      }                                        
    })                
  });

  // Store in local storage
  localStorage.setItem('partlist', JSON.stringify(students));
  //console.log(headings);
  renderList(students);
}

function renderList(students){
  let partlist=document.getElementById("partlist");
  partlist.value="";
  // from stackoverflow: https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
  for (var ssn in students) {
    // skip loop if the property is from prototype
    if (!students.hasOwnProperty(ssn)) continue;

    var s = students[ssn];
    let str=ssn;
    for (var prop in s) {
      // skip loop if the property is from prototype
      if(!s.hasOwnProperty(prop)) continue;

      // separate with ; instead of ,
      str+="; "+s[prop];
    }                
    partlist.value+=str+"\n";
  }
}

function clearData(){
  localStorage.clear("partlist");
  document.getElementById("partlist").value="";
}

$(document).ready(function(){
  $("body").append("<div style='width:440px;padding:8px;height:300px;top:455px;right:20px;background-color:#def;box-shadow:4x 4px 4px #000;border:1px solid red;position:fixed;'><textarea id='partlist' style='width:390px;height:200px;'></textarea><input id='scraper' type='button' value='Scrape'><input id='clearbtn' type='button' value='Clear'></div>");
	$("#scraper").click(getpart);
  $("#clearbtn").click(clearData);
  
  let json=localStorage.getItem('partlist');             
  if (json===null){
    students={};
  }else{
    students=JSON.parse(json);
    renderList(students);

  }  
});

