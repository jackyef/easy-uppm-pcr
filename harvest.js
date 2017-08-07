var request = require('request');
var cheerio = require('cheerio');
var rp = require('request-promise');
var fs = require('fs');

var initials = [];
var harvested = [];
var harvested2 = JSON.parse(fs.readFileSync('uppm.json', 'utf-8'));
var promises = [];

function harvestData(initial) {
  var url = "https://uppm.pcr.ac.id/index.php/main/searchResult/";
  return rp({
    url: url,
    method: 'POST',
    formData: {
      init: initial
    },
    headers: {
      Accept: 'text/html'
    },
  }).then(function(data) {
    var html = data;
    var result = {};

    var error = html.indexOf('Error 404') > -1;
    if (error) {
      result.error = true;
      return result;
    }

    var nameStart = html.indexOf('Nama</td>') + 9 + 46;
    var nameEnd = html.indexOf('</strong>', nameStart);
    result.name = html.substring(nameStart, nameEnd);
    html = html.substring(nameEnd);

    var imgStart = html.indexOf('thumbnail" src="') + 16;
    var imgEnd = html.indexOf('/></td>', imgStart);
    result.img = html.substring(imgStart, imgEnd);
    html = html.substring(imgEnd);

    var initialStart = html.indexOf('Inisial</td>') + 12 + 46;
    result.initial = html.substring(initialStart, initialStart + 3);
    html = html.substring(initialStart + 3);

    var NIPStart = html.indexOf('NIP/NIDN</td>') + 13 + 46;
    var NIPEnd = html.indexOf('</strong>', NIPStart);
    nipOrNidn = html.substring(NIPStart, NIPEnd).split(' / ');
    result.nip = nipOrNidn[0];
    result.nidn = nipOrNidn[1];
    html = html.substring(NIPEnd);

    var emailStart = html.indexOf('Email</td>') + 10 + 46;
    var emailEnd = html.indexOf('</strong>', emailStart);
    result.email = html.substring(emailStart, emailEnd);
    html = html.substring(emailEnd);

    var prodiStart = html.indexOf('Program Studi</td>') + 18 + 46;
    var prodiEnd = html.indexOf('</strong>', prodiStart);
    result.prodi = html.substring(prodiStart, prodiEnd);
    html = html.substring(prodiEnd);

    var jurusanStart = html.indexOf('Jurusan</td>') + 12 + 46;
    var jurusanEnd = html.indexOf('</strong>', jurusanStart);
    result.jurusan = html.substring(jurusanStart, jurusanEnd);
    html = html.substring(jurusanEnd);

    harvested2[result.initial] = result;
    return result;
  }).catch(function(err) {
    err.error = true;
    return err;
  });
}

function harvestInitials() {
  var url = "https://uppm.pcr.ac.id/index.php/main/allStat/";
  return rp({
    url: url,
    method: 'GET',
    headers: {
      Accept: 'text/html'
    },
  }).then(function(data) {
    var html = data;
    var result = {};

    var error = html.indexOf('Error 404') > -1;
    if (error) {
      result.error = true;
      return result;
    }
    var start, end, initial;

    while (true) {
      start = html.indexOf('<input type="hidden" name="init" value="');
      if (start < 0) break;
      start += 40;
      // end = html.indexOf('" />', start);
      initial = html.substring(start, start + 3);
      initials.push(initial);
      console.log(`Got ${initial}, start = ${start}`);
      html = html.substring(start + 3);
    }

    return result;
  }).catch(function(err) {
    err.error = true;
    return err;
  });
}

// console.log("Harvesting initials...");
// harvestInitials().then(function(data) {
//   console.log(JSON.stringify(initials, null, 2));
//   return startHarvestingData();
// })

initials = JSON.parse(fs.readFileSync('initials.json', 'utf8'));

function startHarvestingData() {
  console.log("Start harvesting...");
  for (var initial of initials) {
    // console.log(initial);
    promises.push(harvestData(initial));
    //  promises.push(harvestData(initial).then(function(data) {
    //   if (!data.error) {
    //     harvested.push(data);
    //     console.log(`Harvested data for initial ${data.initial}`);
    //     fs.appendFile("uppm.json", JSON.stringify(data, null, 2) + ",", function(err) {
    //       if (err) {
    //         return console.log(err);
    //       }
    //       console.log(`Appended data for ${data.initial}!`);
    //     })
    //   }
    // }));
  }
}

startHarvestingData();
Promise.all(promises).then(function() {
  var json = JSON.stringify(harvested2, null, 2);
  fs.writeFile("uppm.json", json, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("File saved!");
  });
});