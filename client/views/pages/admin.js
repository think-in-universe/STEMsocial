Template.admin.rendered = function () {
    var JSONEditor = require('jsoneditor')
    var container = document.getElementById('jsoneditor');
    var options = {};
    var editor = new JSONEditor(container, options);
    var json = Session.get('settings')
    editor.set(json);

    document.getElementById('setJSON').onclick = function () {
        $('#errormessage').addClass('hidden');
        $('#errormessage').removeClass('red');
        $('#errormessage').removeClass('green');
        var json = Session.get('settings')
        editor.set(json);
      };

    document.getElementById('getJSON').onclick = function () {
        $('#errormessage').addClass('hidden');
        $('#errormessage').removeClass('red');
        $('#errormessage').removeClass('green');
        var active = document.getElementById('jsonactive'); 
        var memo = document.getElementById('jsonmemo'); 
        var json = editor.get();
        var jsonMetadata = {
            "steemstem_settings": {
            },
            "profile": {
              "name": "SteemStem.Setup",
              "email": "info@steemstem.io",
              "about": "SteemStem Setup Account",
              "location": "Steem",
              "timezone": "+1",
              "locale": "en_US",
              "languages": [
                "en"
              ],
              "website": "https://steemstem.io/",
              "cover_image": "https://steemstem.io/images/steemstem_banner.png",
              "profile_image": "https://steemstem.io/images/steemstem.png"
            }
          }

        jsonMetadata.steemstem_settings = json
        steem.broadcast.accountUpdate(
            active.value,
            'steemstem.setup',
            undefined, // Set to undefined so account authority dont change
            undefined,
            undefined,
            memo.value,
            jsonMetadata,
            function (err, result) {
                if (err)
                {
                    $('#errormessage').removeClass('hidden');
                    $('#errormessage').addClass('red');
                    $('#getJSON').addClass('red');
                    $('#errormessage').text(err.message.slice(0, 250))
                    var temp = setInterval(function () {
                        $('#getJSON').removeClass('red');
                        clearInterval(temp);
                    }, 600);
                }
                else
                {
                    $('#errormessage').removeClass('hidden');
                    $('#errormessage').text('Successfully saved on the blockchain!')
                    $('#getJSON').addClass('green');
                    $('#errormessage').addClass('green');
                    var temp = setInterval(function () {
                        $('#getJSON').removeClass('red');
                        clearInterval(temp);
                    }, 600);
                }
            }
        )
    }
}