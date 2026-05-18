const { google } = require("googleapis");

exports.handler = async (event) => {

  try {

    // 1. Leer DNI desde frontend
    const { dni } = JSON.parse(event.body);

    if (!dni) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "DNI requerido" })
      };
    }

    // 2. Autenticación con Service Account
    const auth = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      null,
      process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    // 3. Conectar con Google Sheets
    const sheets = google.sheets({ version: "v4", auth });

    // 4. Leer datos del Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "Hoja1!A:X"
    });

    const rows = response.data.values || [];

    // 5. Buscar DNI (columna 2 = index 1)
    for (let i = 1; i < rows.length; i++) {

      const row = rows[i];

      if (String(row[1]).trim() === String(dni).trim()) {

        return {
          statusCode: 200,
          body: JSON.stringify({
            nombre: row[0] || "",
            dni: row[1] || "",
            categoria: row[2] || "",
            nota: row[23] || ""
          })
        };

      }

    }

    // 6. No encontrado
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "No encontrado" })
    };

  } catch (error) {

    console.error("ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }

};
