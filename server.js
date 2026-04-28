const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/*So for the results page, i created this helper function insteaad of writing it in the post route
to keep the code organised and easy to to understand and maintain.*/ 

function TheResultPage(headingColor, headingText, name, maskedPassword, cleanID, data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Result</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: ${headingColor}; }
          .file-content { 
            background: #f4f4f4; 
            padding: 10px; 
            margin-top: 20px;
            white-space: pre-wrap;
            font-size: 13px;
            border: 1px solid #ccc;
          }
          a { display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${headingText}</h1>
        <p>${name}, ${maskedPassword}, ${cleanID}</p>
        <div class="file-content">${data}</div>
        <a href="/protectaccess">Go Back</a>
      </body>
    </html>
  `;
}


app.get('/protectaccess', (req, res) => {
    fs.readFile(path.join(__dirname, 'protectaccess.html'), 'utf8', (err, data) => {
        res.send(data);
    });
});

app.post('/protectaccess', (req, res) => {
    const name = req.body.name;
    const pw = req.body.pw;
    const IDnumber = req.body.IDnumber;

    /*For validation i have used regex to check the inputs from the user, the name, password and ID number*/
    let validName = name !== "" && !/^\d+$/.test(name);
    let validPassword = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/.test(pw);
    let validID = /^(\d{3}-\d{3}-\d{3}-\d{3}|\d{12})$/.test(IDnumber);

    const allValid = validName && validPassword && validID;

    const maskedPassword = pw.replace(/./g, '*');
    const cleanID = IDnumber.replace(/[-\.]/g, '');

    /*And here i determine the heading color and text based on the validation results, 
    if all inputs are valid, the heading will be green and show Successful., 
    or it will be red and show Access Denied! Invalid data.*/
    const headingColor = allValid ? 'green' : 'red';
    const headingText = allValid ? 'Successful.' : 'Access Denied! Invalid data.';

    const results = `\nName: ${name}, Password: ${maskedPassword}, ID: ${cleanID}, Valid: ${allValid}`;

    //Here i write the results to the accessresults.txt file
    fs.writeFile(path.join(__dirname, 'accessresults.txt'), results, (err) => {
        if (err) {
            res.send('Error writing results file');
            return;
        }
        
        //Her i read it back to display the results on the results page
        fs.readFile(path.join(__dirname, 'accessresults.txt'), 'utf8', (err, data) => {
            if (err) {
                res.send('Error reading results file');
                return;
            }
            res.send(TheResultPage(headingColor, headingText, name, maskedPassword, cleanID, data));
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000/protectaccess');
});