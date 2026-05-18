const { google } = require("googleapis");

exports.handler = async (event) => {

try{

const { dni } = JSON.parse(event.body);

const auth = new google.auth.JWT(

process.env.CLIENT_EMAIL,
null,
process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),

["https://www.googleapis.com/auth/spreadsheets.readonly"]

);

const sheets = google.sheets({

version:"v4",
auth

});

const response = await sheets.spreadsheets.values.get({

spreadsheetId: process.env.SHEET_ID,

range:"Hoja1!A:X"

});

const data = response.data.values;

for(let i = 1; i < data.length; i++){

if(String(data[i][1]) === String(dni)){

return{

statusCode:200,

body: JSON.stringify({

nombre:data[i][0],
dni:data[i][1],
categoria:data[i][2],
nota:data[i][23]

})

};

}

}

return{

statusCode:404,

body: JSON.stringify({

error:"No encontrado"

})

};

}catch(error){

return{

statusCode:500,

body: JSON.stringify({

error:error.message

})

};

}

};
